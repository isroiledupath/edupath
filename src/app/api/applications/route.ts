import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendApplicationNotification } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listing_id, listing_type, resume_url, motivation_essay } = body;

    if (!listing_id || !listing_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate application
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('applicant_id', user.id)
      .eq('listing_id', listing_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied for this opportunity' },
        { status: 409 }
      );
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        applicant_id: user.id,
        listing_id,
        listing_type,
        resume_url,
        motivation_essay,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Application insert error:', error);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    // Get listing title for notification
    const table = listing_type === 'volunteer' ? 'volunteer_listings' : 'internship_listings';
    const { data: listing } = await supabase
      .from(table)
      .select('title')
      .eq('id', listing_id)
      .single();

    // Create notification for the applicant
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your application for "${listing?.title ?? 'this opportunity'}" has been submitted successfully.`,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Applications route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { application_id, status, organizer_notes } = body;

    if (!application_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update application status
    const { data: application, error } = await supabase
      .from('applications')
      .update({ status, organizer_notes })
      .eq('id', application_id)
      .select('*, applicant:users(email, full_name)')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    // Get listing title
    const table = application.listing_type === 'volunteer' ? 'volunteer_listings' : 'internship_listings';
    const { data: listing } = await supabase
      .from(table)
      .select('title')
      .eq('id', application.listing_id)
      .single();

    // Notify applicant
    await supabase.from('notifications').insert({
      user_id: application.applicant_id,
      type: `application_${status}`,
      title: `Application ${status.replace('_', ' ')}`,
      message: `Your application for "${listing?.title ?? 'an opportunity'}" has been ${status.replace('_', ' ')}.`,
    });

    // Send email notification
    if (application.applicant && ['under_review', 'approved', 'rejected'].includes(status)) {
      await sendApplicationNotification({
        to: application.applicant.email,
        applicantName: application.applicant.full_name,
        listingTitle: listing?.title ?? 'the opportunity',
        status,
      });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Applications PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
