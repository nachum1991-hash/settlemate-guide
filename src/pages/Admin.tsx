import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MessageSquareWarning, LifeBuoy, UserCheck, Users } from 'lucide-react';
import { VerificationQueue } from '@/components/admin/VerificationQueue';
import { ChatModerationPanel } from '@/components/admin/ChatModerationPanel';

const Admin = () => {
  const [tab, setTab] = useState('verification');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-primary/10 p-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin</h1>
            <p className="text-sm text-muted-foreground">Operator console for SettleMate</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto">
            <TabsTrigger value="verification" className="min-h-[44px] gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Verification</span>
              <span className="sm:hidden">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="min-h-[44px] gap-2">
              <MessageSquareWarning className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="support" className="min-h-[44px] gap-2">
              <LifeBuoy className="h-4 w-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="users" className="min-h-[44px] gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="mt-6">
            <VerificationQueue />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatModerationPanel />
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <PlaceholderPanel
              title="Customer support"
              description="Inbox of user tickets with reply threading, status, and priority."
              status="Planned"
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <PlaceholderPanel
              title="Users & roles"
              description="Search users, grant moderator/admin roles, view verification status."
              status="Planned"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const PlaceholderPanel = ({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) => (
  <Card className="w-full border-2 shadow-elevated p-6 sm:p-8">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Badge variant="secondary" className="w-fit">
        {status}
      </Badge>
    </div>
  </Card>
);

export default Admin;
