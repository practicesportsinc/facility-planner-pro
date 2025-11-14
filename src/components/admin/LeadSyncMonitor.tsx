import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  synced_to_google_sheets: boolean;
  sync_attempted_at?: string;
  sync_error?: string;
}

export function LeadSyncMonitor() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingLeadId, setRetryingLeadId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'synced' | 'failed'>('all');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (statusFilter === 'synced') {
        query = query.eq('synced_to_google_sheets', true);
      } else if (statusFilter === 'failed') {
        query = query.eq('synced_to_google_sheets', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleRetrySync = async (leadId: string) => {
    try {
      setRetryingLeadId(leadId);
      
      const { data, error } = await supabase.functions.invoke('retry-lead-sync', {
        body: { leadId }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Lead synced successfully to Google Sheets');
        fetchLeads();
      } else {
        toast.error(data.error || 'Failed to sync lead');
      }
    } catch (error) {
      console.error('Error retrying sync:', error);
      toast.error('Failed to retry sync');
    } finally {
      setRetryingLeadId(null);
    }
  };

  const getSyncStatusBadge = (lead: Lead) => {
    if (lead.synced_to_google_sheets) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Synced
        </Badge>
      );
    }
    
    if (lead.sync_error) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lead Sync Monitor</CardTitle>
            <CardDescription>
              Track lead syncing status to Google Sheets
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Leads</option>
              <option value="synced">Synced Only</option>
              <option value="failed">Failed Only</option>
            </select>
            <Button onClick={fetchLeads} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No leads found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Attempt</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="text-sm">
                      {format(new Date(lead.created_at), 'MM/dd/yy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-sm">{lead.email}</TableCell>
                    <TableCell className="text-sm">{lead.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {lead.source}
                      </Badge>
                    </TableCell>
                    <TableCell>{getSyncStatusBadge(lead)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.sync_attempted_at
                        ? format(new Date(lead.sync_attempted_at), 'MM/dd HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-destructive max-w-xs truncate">
                      {lead.sync_error || '-'}
                    </TableCell>
                    <TableCell>
                      {!lead.synced_to_google_sheets && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetrySync(lead.id)}
                          disabled={retryingLeadId === lead.id}
                        >
                          {retryingLeadId === lead.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Retry
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
