/**
 * Automated Domain Management with SSL Provisioning
 * Handles custom domain setup, DNS verification, and SSL certificate management
 */

import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'kiala.db');

export interface DomainRecord {
  id: string;
  site_id: string;
  domain: string;
  subdomain?: string;
  status: 'pending' | 'dns_pending' | 'ssl_pending' | 'active' | 'failed';
  ssl_status: 'none' | 'pending' | 'issued' | 'expired' | 'failed';
  dns_verified: boolean;
  ssl_certificate_id?: string;
  provider: 'vercel' | 'cloudflare' | 'custom';
  provider_config: Record<string, any>;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  error_message?: string;
}

export interface DNSRecord {
  type: 'CNAME' | 'A' | 'TXT';
  name: string;
  value: string;
  ttl: number;
}

export interface DomainSetupInstructions {
  domain: string;
  dnsRecords: DNSRecord[];
  verificationSteps: string[];
  estimatedTime: string;
  supportUrl: string;
}

class DomainManager {
  private db: Database.Database;

  constructor() {
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables() {
    // Domain records table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS domain_records (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        domain TEXT NOT NULL UNIQUE,
        subdomain TEXT,
        status TEXT DEFAULT 'pending',
        ssl_status TEXT DEFAULT 'none',
        dns_verified BOOLEAN DEFAULT 0,
        ssl_certificate_id TEXT,
        provider TEXT DEFAULT 'vercel',
        provider_config TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME,
        error_message TEXT,
        FOREIGN KEY (site_id) REFERENCES sites(id)
      )
    `);

    // DNS verification challenges table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS dns_challenges (
        id TEXT PRIMARY KEY,
        domain_id TEXT NOT NULL,
        challenge_type TEXT NOT NULL,
        challenge_token TEXT NOT NULL,
        challenge_value TEXT NOT NULL,
        verified BOOLEAN DEFAULT 0,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (domain_id) REFERENCES domain_records(id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_domain_records_site ON domain_records(site_id);
      CREATE INDEX IF NOT EXISTS idx_domain_records_status ON domain_records(status);
      CREATE INDEX IF NOT EXISTS idx_dns_challenges_domain ON dns_challenges(domain_id);
    `);
  }

  /**
   * Add a custom domain for a site
   */
  async addDomain(siteId: string, domain: string, provider: 'vercel' | 'cloudflare' | 'custom' = 'vercel'): Promise<DomainRecord> {
    const domainId = `domain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate domain format
    if (!this.isValidDomain(domain)) {
      throw new Error('Invalid domain format');
    }

    // Check if domain already exists
    const existing = this.db.prepare('SELECT id FROM domain_records WHERE domain = ?').get(domain);
    if (existing) {
      throw new Error('Domain already registered');
    }

    const domainRecord: DomainRecord = {
      id: domainId,
      site_id: siteId,
      domain,
      status: 'pending',
      ssl_status: 'none',
      dns_verified: false,
      provider,
      provider_config: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert domain record
    const stmt = this.db.prepare(`
      INSERT INTO domain_records (
        id, site_id, domain, status, ssl_status, dns_verified, 
        provider, provider_config, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      domainId,
      siteId,
      domain,
      'pending',
      'none',
      0,
      provider,
      JSON.stringify({}),
      domainRecord.created_at,
      domainRecord.updated_at
    );

    // Start the automated setup process
    await this.initiateDomainSetup(domainId);

    return domainRecord;
  }

  /**
   * Get domain setup instructions for manual configuration
   */
  async getDomainSetupInstructions(domainId: string): Promise<DomainSetupInstructions> {
    const domain = this.db.prepare('SELECT * FROM domain_records WHERE id = ?').get(domainId) as any;
    
    if (!domain) {
      throw new Error('Domain not found');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.kiala.com';
    
    return {
      domain: domain.domain,
      dnsRecords: [
        {
          type: 'CNAME',
          name: domain.domain.includes('www') ? domain.domain : `www.${domain.domain}`,
          value: `${baseUrl}`,
          ttl: 300
        },
        {
          type: 'A',
          name: domain.domain,
          value: '76.76.19.61', // Example IP - would be dynamic in production
          ttl: 300
        },
        {
          type: 'TXT',
          name: `_kiala-verify.${domain.domain}`,
          value: `kiala-site-verification=${domainId}`,
          ttl: 300
        }
      ],
      verificationSteps: [
        'Add the DNS records above to your domain registrar',
        'Wait for DNS propagation (up to 48 hours)',
        'Click "Verify Domain" to check configuration',
        'SSL certificate will be automatically provisioned once verified'
      ],
      estimatedTime: '5-10 minutes setup + 24-48 hours for DNS propagation',
      supportUrl: `${baseUrl}/help/custom-domains`
    };
  }

  /**
   * Verify domain DNS configuration
   */
  async verifyDomainDNS(domainId: string): Promise<boolean> {
    const domain = this.db.prepare('SELECT * FROM domain_records WHERE id = ?').get(domainId) as any;
    
    if (!domain) {
      throw new Error('Domain not found');
    }

    try {
      // Simulate DNS verification (in production, use actual DNS resolution)
      const isVerified = await this.checkDNSRecords(domain.domain, domainId);
      
      if (isVerified) {
        // Update domain status
        this.db.prepare(`
          UPDATE domain_records 
          SET dns_verified = 1, status = 'ssl_pending', verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(domainId);

        // Initiate SSL certificate provisioning
        await this.provisionSSLCertificate(domainId);
        
        return true;
      }

      return false;
    } catch (error) {
      // Update error status
      this.db.prepare(`
        UPDATE domain_records 
        SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(String(error), domainId);

      throw error;
    }
  }

  /**
   * Provision SSL certificate for verified domain
   */
  async provisionSSLCertificate(domainId: string): Promise<void> {
    const domain = this.db.prepare('SELECT * FROM domain_records WHERE id = ?').get(domainId) as any;
    
    if (!domain) {
      throw new Error('Domain not found');
    }

    try {
      // Update SSL status to pending
      this.db.prepare(`
        UPDATE domain_records 
        SET ssl_status = 'pending', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(domainId);

      // Simulate SSL certificate provisioning based on provider
      const certificateId = await this.requestSSLCertificate(domain.domain, domain.provider);

      // Update domain with SSL certificate
      this.db.prepare(`
        UPDATE domain_records 
        SET ssl_status = 'issued', ssl_certificate_id = ?, status = 'active', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(certificateId, domainId);

      console.log(`✅ SSL certificate provisioned for ${domain.domain}`);

    } catch (error) {
      // Update SSL error status
      this.db.prepare(`
        UPDATE domain_records 
        SET ssl_status = 'failed', status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(String(error), domainId);

      throw error;
    }
  }

  /**
   * Get all domains for a site
   */
  async getSiteDomains(siteId: string): Promise<DomainRecord[]> {
    const domains = this.db.prepare(`
      SELECT * FROM domain_records 
      WHERE site_id = ? 
      ORDER BY created_at DESC
    `).all(siteId) as any[];

    return domains.map(domain => ({
      ...domain,
      dns_verified: Boolean(domain.dns_verified),
      provider_config: JSON.parse(domain.provider_config)
    }));
  }

  /**
   * Remove domain from site
   */
  async removeDomain(domainId: string): Promise<void> {
    const domain = this.db.prepare('SELECT * FROM domain_records WHERE id = ?').get(domainId) as any;
    
    if (!domain) {
      throw new Error('Domain not found');
    }

    // Revoke SSL certificate if exists
    if (domain.ssl_certificate_id) {
      await this.revokeSSLCertificate(domain.ssl_certificate_id, domain.provider);
    }

    // Delete domain record and related challenges
    this.db.prepare('DELETE FROM dns_challenges WHERE domain_id = ?').run(domainId);
    this.db.prepare('DELETE FROM domain_records WHERE id = ?').run(domainId);

    console.log(`🗑️ Domain ${domain.domain} removed`);
  }

  /**
   * Get domain by custom domain name (for routing)
   */
  async getDomainByName(domain: string): Promise<DomainRecord | null> {
    const record = this.db.prepare(`
      SELECT * FROM domain_records 
      WHERE domain = ? AND status = 'active' AND dns_verified = 1
    `).get(domain) as any;

    if (!record) return null;

    return {
      ...record,
      dns_verified: Boolean(record.dns_verified),
      provider_config: JSON.parse(record.provider_config)
    };
  }

  // Private helper methods

  private async initiateDomainSetup(domainId: string): Promise<void> {
    // Update status to indicate DNS setup is needed
    this.db.prepare(`
      UPDATE domain_records 
      SET status = 'dns_pending', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(domainId);

    console.log(`🌐 Domain setup initiated for ${domainId}`);
  }

  private async checkDNSRecords(domain: string, domainId: string): Promise<boolean> {
    // In production, this would use actual DNS resolution libraries
    // For now, simulate verification with a delay
    
    console.log(`🔍 Checking DNS records for ${domain}...`);
    
    // Simulate DNS check delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful verification (in production, check actual DNS)
    // This would verify CNAME/A records point to our infrastructure
    const dnsVerified = Math.random() > 0.3; // 70% success rate for demo
    
    if (dnsVerified) {
      console.log(`✅ DNS verified for ${domain}`);
    } else {
      console.log(`❌ DNS verification failed for ${domain}`);
    }
    
    return dnsVerified;
  }

  private async requestSSLCertificate(domain: string, provider: string): Promise<string> {
    console.log(`🔐 Requesting SSL certificate for ${domain} via ${provider}...`);
    
    // In production, this would integrate with:
    // - Vercel API for Vercel deployments
    // - Cloudflare API for Cloudflare-managed domains
    // - Let's Encrypt for custom setups
    
    // Simulate certificate provisioning
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const certificateId = `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ SSL certificate ${certificateId} issued for ${domain}`);
    
    return certificateId;
  }

  private async revokeSSLCertificate(certificateId: string, provider: string): Promise<void> {
    console.log(`🔐 Revoking SSL certificate ${certificateId} via ${provider}...`);
    
    // In production, this would revoke the actual certificate
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ SSL certificate ${certificateId} revoked`);
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    return domainRegex.test(domain);
  }

  /**
   * Background job to monitor and update domain statuses
   */
  async monitorDomains(): Promise<void> {
    const pendingDomains = this.db.prepare(`
      SELECT * FROM domain_records 
      WHERE status IN ('dns_pending', 'ssl_pending') 
      AND updated_at < datetime('now', '-5 minutes')
    `).all() as any[];

    for (const domain of pendingDomains) {
      try {
        if (domain.status === 'dns_pending') {
          await this.verifyDomainDNS(domain.id);
        } else if (domain.status === 'ssl_pending') {
          await this.provisionSSLCertificate(domain.id);
        }
      } catch (error) {
        console.error(`Error monitoring domain ${domain.domain}:`, error);
      }
    }
  }

  /**
   * Get domain statistics for admin dashboard
   */
  getDomainStats(): { total: number; active: number; pending: number; failed: number } {
    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status IN ('pending', 'dns_pending', 'ssl_pending') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM domain_records
    `).get() as any;

    return stats;
  }
}

// Singleton instance
export const domainManager = new DomainManager();

// Background monitoring (runs every 5 minutes in production)
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    domainManager.monitorDomains().catch(console.error);
  }, 5 * 60 * 1000);
}