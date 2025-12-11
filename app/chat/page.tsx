import { cookies } from 'next/headers';
import ChatInterface from './ChatInterface';

export default async function ChatPage()
{
  const cookieStore = await cookies();
  const creditsString = cookieStore.get('message_credits')?.value;
  console.log(`[DEBUG] ChatPage Server Component - Cookie credits: ${creditsString}`);
  const initialCredits = creditsString ? parseInt(creditsString) : 0;

  return <ChatInterface initialCredits={initialCredits} />;
}
