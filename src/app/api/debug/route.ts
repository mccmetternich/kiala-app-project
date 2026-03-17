import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: Date.now(),
    message: "Debug endpoint working",
    widgetTest: "three-way-comparison widget should be supported"
  });
}