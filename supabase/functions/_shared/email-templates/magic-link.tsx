/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your secure SettleMate sign-in link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandHeader}>
          <Text style={wordmark}>SettleMate</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Sign in to SettleMate</Heading>
          <Text style={text}>
            Tap the button below to sign in. This link is single-use and will
            expire shortly for your security.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Sign in to SettleMate
            </Button>
          </Section>
          <Text style={smallText}>
            Or paste this link into your browser:
            <br />
            <Link href={confirmationUrl} style={link}>
              {confirmationUrl}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn't request this link, you can safely ignore this email.
          </Text>
        </Section>
        <Text style={brandFooter}>{siteName} · Your friendly guide to settling in Italy</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
const smallText = {
  fontFamily: fontStack,
  fontSize: '13px',
  color: '#6B7280',
  lineHeight: '1.6',
  margin: '20px 0 0',
  wordBreak: 'break-all' as const,
}
const buttonWrap = { textAlign: 'center' as const, padding: '12px 0 8px' }
const button = {
  backgroundColor: '#3B4CCA',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '999px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  fontFamily: fontStack,
}
const link = { color: '#3B4CCA', textDecoration: 'underline' }
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
