import { useState } from 'react'
import { Webhook, Plus, Trash2, CheckCircle2, XCircle, RotateCcw, Shield, Code } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  INITIAL_WEBHOOKS,
  INITIAL_WEBHOOK_LOGS,
  AVAILABLE_WEBHOOK_EVENTS,
  type WebhookEndpointItem,
  type WebhookLogItem,
} from '../api-keys/data'

export function WebhooksSettings() {
  const [endpoints, setEndpoints] = useState<WebhookEndpointItem[]>(INITIAL_WEBHOOKS)
  const [logs, setLogs] = useState<WebhookLogItem[]>(INITIAL_WEBHOOK_LOGS)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<WebhookLogItem | null>(null)

  const [newUrl, setNewUrl] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['user.created', 'invoice.payment_succeeded'])

  const handleCreateEndpoint = () => {
    if (!newUrl.trim() || !newUrl.startsWith('https://')) {
      toast.error('Please enter a valid secure HTTPS endpoint URL')
      return
    }

    const newEndpoint: WebhookEndpointItem = {
      id: `wh_${Date.now()}`,
      url: newUrl.trim(),
      description: newDesc.trim() || 'Custom destination endpoint',
      events: selectedEvents,
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}...`,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setEndpoints((prev) => [newEndpoint, ...prev])
    setIsAddOpen(false)
    setNewUrl('')
    setNewDesc('')
    toast.success('Webhook endpoint registered!')
  }

  const handleDeleteEndpoint = (id: string) => {
    setEndpoints((prev) => prev.filter((e) => e.id !== id))
    toast.success('Webhook endpoint removed')
  }

  const handleToggleActive = (id: string) => {
    setEndpoints((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
    )
    toast.info('Webhook status updated')
  }

  const handleRetryWebhook = (log: WebhookLogItem) => {
    toast.loading(`Retrying event ${log.event}...`)
    setTimeout(() => {
      setLogs((prev) => [
        {
          id: `log_${Date.now()}`,
          endpointId: log.endpointId,
          event: log.event,
          statusCode: 200,
          deliveredAt: 'Just now (retry)',
          durationMs: 110,
          requestPayload: log.requestPayload,
          responseBody: '{"received": true, "retry": true}',
        },
        ...prev,
      ])
      toast.success('Webhook retry succeeded with HTTP 200')
    }, 800)
  }

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto scroll-smooth pe-4 pb-12 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>Webhook Subscriptions</h2>
          <p className='text-sm text-muted-foreground'>
            Receive real-time HTTP POST notifications whenever critical events happen in your workspace.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} size='sm'>
          <Plus className='size-4 mr-1.5' /> Add Endpoint
        </Button>
      </div>

      <Tabs defaultValue='endpoints' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='endpoints' className='gap-2'>
            <Webhook className='size-4' /> Endpoints ({endpoints.length})
          </TabsTrigger>
          <TabsTrigger value='logs' className='gap-2'>
            <Code className='size-4' /> Delivery Logs ({logs.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ENDPOINTS */}
        <TabsContent value='endpoints'>
          <Card className='shadow-sm'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Registered Destinations</CardTitle>
              <CardDescription>
                All webhook payloads are cryptographically signed with the HMAC SHA-256 header.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {endpoints.length === 0 ? (
                  <p className='text-center py-8 text-muted-foreground text-sm'>
                    No webhook endpoints configured. Click "Add Endpoint" to register a URL.
                  </p>
                ) : (
                  endpoints.map((ep) => (
                    <div
                      key={ep.id}
                      className='rounded-lg border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card shadow-xs'
                    >
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-2'>
                          <span className='font-mono text-sm font-semibold'>{ep.url}</span>
                          <Badge variant={ep.isActive ? 'default' : 'secondary'} className='text-[10px]'>
                            {ep.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground'>{ep.description}</p>
                        <div className='flex flex-wrap gap-1.5 pt-1'>
                          {ep.events.map((ev) => (
                            <Badge key={ev} variant='outline' className='text-[10px] bg-muted/30'>
                              {ev}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className='flex items-center gap-3 shrink-0'>
                        <Switch
                          checked={ep.isActive}
                          onCheckedChange={() => handleToggleActive(ep.id)}
                        />
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive hover:text-destructive'
                          onClick={() => handleDeleteEndpoint(ep.id)}
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: DELIVERY LOGS */}
        <TabsContent value='logs'>
          <Card className='shadow-sm'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Recent Deliveries</CardTitle>
              <CardDescription>Inspect payload deliveries, response status, and retry failed attempts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={`gap-1 text-[10px] ${
                            log.statusCode === 200
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}
                        >
                          {log.statusCode === 200 ? (
                            <CheckCircle2 className='size-3 text-emerald-500' />
                          ) : (
                            <XCircle className='size-3 text-rose-500' />
                          )}
                          HTTP {log.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className='font-mono text-xs'>{log.event}</TableCell>
                      <TableCell className='text-xs text-muted-foreground'>{log.deliveredAt}</TableCell>
                      <TableCell className='text-xs text-muted-foreground'>{log.durationMs}ms</TableCell>
                      <TableCell className='text-right space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-7 text-xs'
                          onClick={() => setSelectedLog(log)}
                        >
                          Inspect
                        </Button>
                        {log.statusCode !== 200 && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 text-xs text-primary'
                            onClick={() => handleRetryWebhook(log)}
                          >
                            <RotateCcw className='size-3 mr-1' /> Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CREATE MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Shield className='size-5 text-primary' /> Add Webhook Endpoint
            </DialogTitle>
            <DialogDescription>
              We will send encrypted event payloads to this URL with an HMAC signature header.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Payload URL (HTTPS required)</Label>
              <Input
                placeholder='https://your-domain.com/api/webhooks'
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Description</Label>
              <Input
                placeholder='e.g. Sync customer invoices to internal DB'
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-xs'>Subscribe to Events</Label>
              <div className='grid grid-cols-2 gap-2 border rounded-md p-3 max-h-48 overflow-y-auto'>
                {AVAILABLE_WEBHOOK_EVENTS.map((ev) => (
                  <label key={ev} className='flex items-center gap-2 text-xs cursor-pointer'>
                    <Checkbox
                      checked={selectedEvents.includes(ev)}
                      onCheckedChange={(checked) =>
                        setSelectedEvents((prev) =>
                          checked ? [...prev, ev] : prev.filter((item) => item !== ev)
                        )
                      }
                    />
                    <span className='font-mono text-[11px]'>{ev}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEndpoint}>Save Endpoint</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INSPECT LOG MODAL */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle className='text-base font-semibold flex items-center gap-2'>
              Webhook Delivery Details
              {selectedLog && (
                <Badge
                  variant='secondary'
                  className={`text-[10px] ${
                    selectedLog.statusCode === 200 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  HTTP {selectedLog.statusCode}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Review the outgoing JSON payload and target server response.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className='space-y-3 py-2'>
              <div>
                <Label className='text-xs font-semibold'>Request Payload (JSON)</Label>
                <pre className='mt-1 rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto'>
                  {JSON.stringify(selectedLog.requestPayload, null, 2)}
                </pre>
              </div>
              <div>
                <Label className='text-xs font-semibold'>Server Response</Label>
                <pre className='mt-1 rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto'>
                  {selectedLog.responseBody}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedLog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
