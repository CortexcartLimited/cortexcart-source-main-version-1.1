import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'; import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    const userEmail = session.user.email;
    const { ticketId } = params;

    if (!ticketId) {
        return NextResponse.json({ message: 'Ticket ID is required' }, { status: 400 });
    }

    try {
        const connection = await db.getConnection();

        console.log(`[SupportAPI] Fetching ticket ${ticketId} for user ${userEmail}`);

        // 1. Check if the ticket exists at all
        const [existingTickets] = await connection.query(
            'SELECT * FROM support_tickets WHERE id = ?',
            [ticketId]
        );

        if (existingTickets.length === 0) {
            console.log(`[SupportAPI] Ticket ${ticketId} not found in DB.`);
            connection.release();
            return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
        }

        // 2. Check ownership
        const ticket = existingTickets[0];
        if (ticket.user_email !== userEmail) {
            console.log(`[SupportAPI] Access denied. Ticket owner: ${ticket.user_email}, Requester: ${userEmail}`);
            connection.release();
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        // 3. Fetch replies
        const [replies] = await connection.query(
            'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC',
            [ticketId]
        );

        connection.release();

        const ticketData = {
            ticket: ticket,
            replies: replies,
        };


        return NextResponse.json(ticketData, { status: 200 });
    } catch (error) {
        console.error("Error fetching single support ticket:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
