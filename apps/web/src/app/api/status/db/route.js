import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        status: 'Error',
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection with a simple query
    const { error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Database check failed:', error);
      return NextResponse.json({ 
        status: 'Error', 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database check failed:', error);
    return NextResponse.json({ 
      status: 'Error',
      error: error.message 
    }, { status: 500 });
  }
}
