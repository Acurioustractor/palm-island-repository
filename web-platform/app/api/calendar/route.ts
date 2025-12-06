/**
 * Cultural Calendar API
 *
 * Manage community events and cultural dates.
 */

import { NextResponse } from 'next/server';
import {
  getEvents,
  getUpcomingEvents,
  getEventsForMonth,
  createEvent,
  updateEvent,
  deleteEvent,
  getTodaySignificance,
  type CulturalEvent
} from '@/lib/calendar/events';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';

  try {
    switch (action) {
      case 'upcoming':
        const count = parseInt(searchParams.get('count') || '5');
        const upcoming = await getUpcomingEvents(count);
        return NextResponse.json({
          action: 'upcoming',
          events: upcoming,
          count: upcoming.length
        });

      case 'month':
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
        const monthEvents = await getEventsForMonth(year, month);
        return NextResponse.json({
          action: 'month',
          year,
          month,
          events: monthEvents,
          count: monthEvents.length
        });

      case 'today':
        const today = await getTodaySignificance();
        return NextResponse.json({
          action: 'today',
          ...today
        });

      case 'list':
      default:
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');
        const types = searchParams.get('types')?.split(',') as any;
        const includeNational = searchParams.get('national') !== 'false';
        const limit = parseInt(searchParams.get('limit') || '50');

        const events = await getEvents({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          types,
          includeNational,
          limit
        });

        return NextResponse.json({
          action: 'list',
          events,
          count: events.length,
          filters: { startDate, endDate, types, includeNational }
        });
    }
  } catch (error: any) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch events'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.date) {
      return NextResponse.json({
        error: 'title and date are required'
      }, { status: 400 });
    }

    const event = await createEvent({
      title: body.title,
      description: body.description,
      date: body.date,
      endDate: body.endDate,
      type: body.type || 'community',
      isRecurring: body.isRecurring || false,
      recurrenceRule: body.recurrenceRule,
      location: body.location,
      organizer: body.organizer,
      relatedStoryIds: body.relatedStoryIds,
      relatedKnowledgeIds: body.relatedKnowledgeIds,
      culturalSignificance: body.culturalSignificance,
      isPublic: body.isPublic !== false
    });

    if (!event) {
      return NextResponse.json({
        error: 'Failed to create event'
      }, { status: 500 });
    }

    return NextResponse.json({
      event,
      message: 'Event created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Calendar POST error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to create event'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({
        error: 'Event ID required'
      }, { status: 400 });
    }

    const event = await updateEvent(body.id, body);

    if (!event) {
      return NextResponse.json({
        error: 'Failed to update event'
      }, { status: 500 });
    }

    return NextResponse.json({
      event,
      message: 'Event updated successfully'
    });

  } catch (error: any) {
    console.error('Calendar PUT error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to update event'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({
      error: 'Event ID required'
    }, { status: 400 });
  }

  try {
    const success = await deleteEvent(id);

    if (!success) {
      return NextResponse.json({
        error: 'Failed to delete event'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Event deleted successfully'
    });

  } catch (error: any) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to delete event'
    }, { status: 500 });
  }
}
