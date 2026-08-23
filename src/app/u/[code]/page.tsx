import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InvitationPage } from '@/components/invitation/InvitationPage'
import { buildInvitationMetadata } from '@/lib/metadata'
import { supabase } from '@/lib/supabase'

interface Props {
  params: { code: string }
}

// ⬇️ PENTING: Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildInvitationMetadata(params.code)
}

export default async function UndanganPage({ params }: Props) {
  const code = params.code.toUpperCase()

  // Check kode di server
  const { data: guest, error } = await supabase
    .from('guests')
    .select('id')
    .eq('code', code)
    .single()

  // Jika kode tidak ada, trigger 404 (akan render not-found.tsx)
  if (error || !guest) {
    notFound()
  }
  // return <InvitationPage code={params.code} />
  return <InvitationPage code={code} />
}