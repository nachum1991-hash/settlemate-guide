/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your SettleMate verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandHeader}>
          <Text style={wordmark}>SettleMate</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Confirm it's you</Heading>
          <Text style={text}>
            Enter this verification code in SettleMate to confirm your identity:
          </Text>
          <Section style={codeWrap}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={text}>This code will expire shortly.</Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn't request this, you can safely ignore this email — but
            consider changing your password just in case.
          </Text>
        </Section>
        <Text style={brandFooter}>SettleMate · Your friendly guide to settling in Italy</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const fontStack =
  "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

const main = { backgroundColor: '#ffffff', fontFamily: fontStack, margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 20px' }
const brandHeader = { textAlign: 'center' as const, padding: '0 0 20px' }
const wordmark = {
  fontFamily: fontStack,
  fontSize: '22px',
  fontWeight: 700 as const,
  letterSpacing: '-0.01em',
  color: '#3B4CCA',
  margin: 0,
}
const card = {
  backgroundColor: '#FAFAF9',
  borderRadius: '16px',
  border: '1px solid #E5E7EB',
  padding: '32px 28px',
}
const h1 = {
  fontFamily: fontStack,
  fontSize: '24px',
  fontWeight: 700 as const,
  color: '#1F2937',
  margin: '0 0 16px',
  lineHeight: '1.3',
}
const text = {
  fontFamily: fontStack,
  fontSize: '15px',
  color: '#1F2937',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const codeWrap = { textAlign: 'center' as const, padding: '8px 0 16px' }
const codeStyle = {
  fontFamily: "'DM Mono', 'Courier New', monospace",
  fontSize: '32px',
  fontWeight: 700 as const,
  letterSpacing: '0.4em',
  color: '#3B4CCA',
  backgroundColor: '#ffffff',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: 0,
  display: 'inline-block',
}
const hr = { borderColor: '#E5E7EB', margin: '24px 0 16px' }
const footer = {
  fontFamily: fontStack,
  fontSize: '13px',
  color: '#6B7280',
  lineHeight: '1.6',
  margin: 0,
}
const brandFooter = {
  fontFamily: fontStack,
  fontSize: '12px',
  color: '#9CA3AF',
  textAlign: 'center' as const,
  margin: '24px 0 0',
}
