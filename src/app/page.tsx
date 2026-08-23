import type { Metadata } from 'next'
import { LockedCoverPage } from '@/components/invitation/LockedCoverPage'
import { buildInvitationMetadata } from '@/lib/metadata'

// ⬇️ PENTING: Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  return buildInvitationMetadata()
}

export default function Home() {
  return <LockedCoverPage />
}