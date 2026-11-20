import React, { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import {
  Check,
  CreditCard,
  Download,
  HelpCircle,
  Layers,
  Sparkles,
  Zap,
  HardDrive,
  Users,
  Activity,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { useCurrentWorkspace, workspaceMutations } from '@/features/workspaces/api'
import {
  BILLING_PLANS,
  MOCK_INVOICES,
  FEATURE_COMPARISON_MATRIX,
  type PlanTier,
} from './data/billing-data'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function BillingPage() {
  const queryClient = useQueryClient()
  const currentWorkspace = useCurrentWorkspace()
  const currentPlanId = currentWorkspace?.plan || 'community'
  const currentPlan =
    BILLING_PLANS.find((p) => p.id === currentPlanId) || BILLING_PLANS[0]

  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'compare' | 'invoices'>('overview')
  const [isYearly, setIsYearly] = useState(false)
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanTier | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const updatePlanMutation = useMutation(workspaceMutations.updatePlan(queryClient))

  const handleOpenUpgrade = (plan: PlanTier) => {
    setSelectedPlanForUpgrade(plan)
    setIsCheckoutOpen(true)
  }

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanForUpgrade || !currentWorkspace) return
    try {
      await updatePlanMutation.mutateAsync({
        workspaceId: currentWorkspace.id,
        plan: selectedPlanForUpgrade.id,
      })
      toast.success(
        `Successfully upgraded to ${selectedPlanForUpgrade.name}! Your workspace now has new quota limits.`
      )
      setIsCheckoutOpen(false)
    } catch {
      toast.error('Failed to change plan. Please try again.')
    }
  }

  const handleCancelSubscription = async () => {
    if (!currentWorkspace) return
    try {
      await updatePlanMutation.mutateAsync({
        workspaceId: currentWorkspace.id,
        plan: 'community',
      })
      toast.info('Your plan has been downgraded to Community / Free.')
      setIsCancelModalOpen(false)
    } catch {
      toast.error('Failed to cancel plan.')
    }
  }

  // Usage mock calculations based on active plan
  const seatLimit = currentPlan.limits.seats
  const seatsUsed = 2
  const seatPercent = Math.min(100, Math.round((seatsUsed / seatLimit) * 100))

  const storageLimit = currentPlan.limits.storageGB
  const storageUsed = currentPlanId === 'community' ? 0.4 : currentPlanId === 'sandbox' ? 4.2 : 18.5
  const storagePercent = Math.min(100, Math.round((storageUsed / storageLimit) * 100))

  const apiLimit = currentPlan.limits.apiCallsMonthly
  const apiUsed = currentPlanId === 'community' ? 850 : currentPlanId === 'sandbox' ? 24500 : 124000
  const apiPercent = Math.min(100, Math.round((apiUsed / apiLimit) * 100))

  return (
    <DashboardPage
      title='Billing & Subscription'
      description={`Manage your subscription plans, team usage, invoices, and payment details for ${currentWorkspace?.name ?? 'your workspace'}.`}
    >
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className='space-y-6'
      >
        <TabsList className='grid grid-cols-2 sm:grid-cols-4 max-w-2xl'>
          <TabsTrigger value='overview' className='gap-2'>
            <Layers className='size-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='plans' className='gap-2'>
            <Sparkles className='size-4' />
            Plans & Pricing
          </TabsTrigger>
          <TabsTrigger value='compare' className='gap-2'>
            <HelpCircle className='size-4' />
            Compare
          </TabsTrigger>
          <TabsTrigger value='invoices' className='gap-2'>
            <Receipt className='size-4' />
            Invoices
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value='overview' className='space-y-6'>
          {/* Plan Summary Card */}
          <div className='grid gap-6 md:grid-cols-3'>
            <Card className='md:col-span-2 border-primary/20 shadow-sm'>
              <CardHeader className='flex flex-row items-start justify-between pb-4'>
                <div>
                  <Badge variant='outline' className='mb-2 text-primary border-primary/30'>
                    Current Active Plan
                  </Badge>
                  <CardTitle className='text-2xl font-bold flex items-center gap-2'>
                    {currentPlan.name}
                    {currentPlan.popular && (
                      <Badge className='bg-primary/90 text-primary-foreground text-xs'>Popular</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className='mt-1.5'>
                    {currentPlan.description}
                  </CardDescription>
                </div>
                <div className='text-right'>
                  <span className='text-3xl font-bold'>${currentPlan.monthlyPrice}</span>
                  <span className='text-muted-foreground text-sm'>/month</span>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg bg-muted/40 p-4 border flex items-center justify-between flex-wrap gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-primary/10 p-2 text-primary'>
                      <CreditCard className='size-5' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Payment Method</p>
                      <p className='text-xs text-muted-foreground'>Visa ending in 4242 (Expires 12/28)</p>
                    </div>
                  </div>
                  <Button variant='outline' size='sm' onClick={() => toast.info('Stripe Customer Portal redirect simulated')}>
                    Update Card
                  </Button>
                </div>
              </CardContent>
              <CardFooter className='flex justify-between border-t pt-4 bg-muted/10 flex-wrap gap-2'>
                <p className='text-xs text-muted-foreground flex items-center gap-1.5'>
                  <CheckCircle2 className='size-3.5 text-green-500' /> Next billing date: December 1, 2026
                </p>
                <div className='flex items-center gap-2'>
                  {currentPlanId !== 'community' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-destructive hover:text-destructive'
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  <Button size='sm' onClick={() => setActiveTab('plans')}>
                    Change Plan
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Quick Actions Card */}
            <Card className='shadow-sm flex flex-col justify-between'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>Billing Actions</CardTitle>
                <CardDescription>Shortcuts for managing billing cycle and invoices</CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button
                  variant='outline'
                  className='w-full justify-between text-xs'
                  onClick={() => setActiveTab('invoices')}
                >
                  <span className='flex items-center gap-2'>
                    <Receipt className='size-4 text-muted-foreground' />
                    View Invoices
                  </span>
                  <Badge variant='secondary' className='text-[10px]'>{MOCK_INVOICES.length}</Badge>
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-between text-xs'
                  onClick={() => setActiveTab('compare')}
                >
                  <span className='flex items-center gap-2'>
                    <HelpCircle className='size-4 text-muted-foreground' />
                    Feature Comparison
                  </span>
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-between text-xs'
                  onClick={() => toast.info('Connecting to Stripe Billing Portal...')}
                >
                  <span className='flex items-center gap-2'>
                    <ExternalLink className='size-4 text-muted-foreground' />
                    Customer Portal
                  </span>
                </Button>
              </CardContent>
              <CardFooter className='border-t pt-4 text-xs text-muted-foreground'>
                Need enterprise tax receipt? Contact finance@acme.com
              </CardFooter>
            </Card>
          </div>

          {/* Usage Meters */}
          <div>
            <h3 className='text-lg font-semibold tracking-tight mb-3'>Workspace Resource Usage</h3>
            <div className='grid gap-4 md:grid-cols-3'>
              {/* Seats Usage */}
              <Card className='shadow-sm'>
                <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <Users className='size-4 text-primary' />
                    Team Seats
                  </CardTitle>
                  <span className='text-xs font-semibold'>
                    {seatsUsed} / {seatLimit === 9999 ? '∞' : seatLimit}
                  </span>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <Progress value={seatPercent} />
                  <p className='text-xs text-muted-foreground'>
                    {seatLimit === 9999 ? 'Unlimited seats available' : `${seatLimit - seatsUsed} seats remaining on ${currentPlan.name}`}
                  </p>
                </CardContent>
              </Card>

              {/* Storage Usage */}
              <Card className='shadow-sm'>
                <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <HardDrive className='size-4 text-primary' />
                    Cloud Storage
                  </CardTitle>
                  <span className='text-xs font-semibold'>
                    {storageUsed}GB / {storageLimit}GB
                  </span>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <Progress value={storagePercent} />
                  <p className='text-xs text-muted-foreground'>
                    {storagePercent}% used of dedicated workspace assets
                  </p>
                </CardContent>
              </Card>

              {/* API Calls Usage */}
              <Card className='shadow-sm'>
                <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <Activity className='size-4 text-primary' />
                    API Requests
                  </CardTitle>
                  <span className='text-xs font-semibold'>
                    {apiUsed.toLocaleString()} / {apiLimit === 10000000 ? '∞' : apiLimit.toLocaleString()}
                  </span>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <Progress value={apiPercent} />
                  <p className='text-xs text-muted-foreground'>
                    Resets automatically on the 1st of every month
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PLANS & PRICING */}
        <TabsContent value='plans' className='space-y-8'>
          <div className='flex flex-col items-center justify-center space-y-3 text-center'>
            <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Flexible plans tailored for your team scale
            </h2>
            <p className='text-muted-foreground text-sm max-w-xl'>
              Upgrade, downgrade, or cancel anytime. All plans include automated database backups and instant API access.
            </p>
            {/* Monthly / Yearly Toggle */}
            <div className='flex items-center gap-3 pt-2'>
              <Label htmlFor='billing-switch' className={`text-sm ${!isYearly ? 'font-bold' : 'text-muted-foreground'}`}>
                Monthly billing
              </Label>
              <Switch
                id='billing-switch'
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor='billing-switch' className={`text-sm flex items-center gap-1.5 ${isYearly ? 'font-bold' : 'text-muted-foreground'}`}>
                Yearly billing
                <Badge variant='secondary' className='text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold'>
                  Save 20%
                </Badge>
              </Label>
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {BILLING_PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlanId
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice

              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col justify-between transition-all relative ${
                    plan.highlight
                      ? 'border-primary ring-1 ring-primary shadow-md'
                      : 'border-border shadow-sm hover:border-primary/50'
                  }`}
                >
                  {plan.highlight && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                      <Badge className='bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-0.5'>
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className='text-xl'>{plan.name}</CardTitle>
                    <CardDescription className='min-h-[40px] text-xs'>
                      {plan.description}
                    </CardDescription>
                    <div className='pt-4'>
                      <span className='text-3xl font-extrabold'>${price}</span>
                      <span className='text-xs text-muted-foreground'> /month</span>
                      {isYearly && plan.monthlyPrice > 0 && (
                        <p className='text-[11px] text-emerald-600 font-medium mt-1'>
                          Billed yearly (${price * 12}/year)
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-2.5 flex-1 border-t pt-4 text-xs'>
                    <p className='font-semibold text-foreground/80 mb-2'>What is included:</p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className='flex items-start gap-2'>
                        <Check className='size-3.5 text-primary shrink-0 mt-0.5' />
                        <span className='text-muted-foreground'>{feature}</span>
                      </div>
                    ))}
                  </CardContent>

                  <CardFooter className='border-t pt-4 bg-muted/5'>
                    {isCurrent ? (
                      <Button variant='outline' disabled className='w-full text-xs font-semibold'>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className='w-full text-xs'
                        variant={plan.highlight ? 'default' : 'outline'}
                        onClick={() => handleOpenUpgrade(plan)}
                      >
                        {plan.monthlyPrice === 0 ? 'Downgrade to Free' : 'Select Plan'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* TAB 3: FEATURE COMPARISON */}
        <TabsContent value='compare'>
          <Card className='shadow-sm'>
            <CardHeader>
              <CardTitle className='text-xl'>Detailed Feature Comparison</CardTitle>
              <CardDescription>
                Compare specifications, limits, security, and developer options across all tiers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[300px]'>Features</TableHead>
                      <TableHead>Community</TableHead>
                      <TableHead>Sandbox</TableHead>
                      <TableHead className='text-primary font-bold'>Professional</TableHead>
                      <TableHead>Enterprise</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FEATURE_COMPARISON_MATRIX.map((group, groupIndex) => (
                      <React.Fragment key={groupIndex}>
                        <TableRow className='bg-muted/40 font-semibold'>
                          <TableCell colSpan={5} className='py-2 text-xs uppercase tracking-wider text-muted-foreground'>
                            {group.category}
                          </TableCell>
                        </TableRow>
                        {group.features.map((item, itemIndex) => (
                          <TableRow key={itemIndex}>
                            <TableCell className='font-medium text-xs'>{item.name}</TableCell>
                            <TableCell className='text-xs'>
                              {typeof item.free === 'boolean' ? (
                                item.free ? <Check className='size-4 text-emerald-500' /> : <span className='text-muted-foreground'>—</span>
                              ) : (
                                item.free
                              )}
                            </TableCell>
                            <TableCell className='text-xs'>
                              {typeof item.starter === 'boolean' ? (
                                item.starter ? <Check className='size-4 text-emerald-500' /> : <span className='text-muted-foreground'>—</span>
                              ) : (
                                item.starter
                              )}
                            </TableCell>
                            <TableCell className='text-xs font-semibold text-primary'>
                              {typeof item.pro === 'boolean' ? (
                                item.pro ? <Check className='size-4 text-primary' /> : <span className='text-muted-foreground'>—</span>
                              ) : (
                                item.pro
                              )}
                            </TableCell>
                            <TableCell className='text-xs'>
                              {typeof item.enterprise === 'boolean' ? (
                                item.enterprise ? <Check className='size-4 text-emerald-500' /> : <span className='text-muted-foreground'>—</span>
                              ) : (
                                item.enterprise
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: INVOICES & RECEIPTS */}
        <TabsContent value='invoices'>
          <Card className='shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle className='text-xl'>Invoice History</CardTitle>
                <CardDescription>
                  Download past receipts and monitor payment status for accounting.
                </CardDescription>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => toast.info('Exporting invoice records to CSV...')}
              >
                <Download className='size-4 mr-1.5' /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_INVOICES.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className='font-medium text-xs'>{inv.invoiceNumber}</TableCell>
                      <TableCell className='text-xs text-muted-foreground'>{inv.date}</TableCell>
                      <TableCell className='text-xs'>{inv.planName}</TableCell>
                      <TableCell className='text-xs font-bold'>${inv.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className='text-[10px] bg-emerald-500/10 text-emerald-600 capitalize'
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 text-xs'
                          onClick={() => toast.success(`Simulating download for ${inv.invoiceNumber}.pdf`)}
                        >
                          <Download className='size-3.5 mr-1' /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CHECKOUT MODAL */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Zap className='size-5 text-primary' />
              Confirm Plan Subscription
            </DialogTitle>
            <DialogDescription>
              Review your selection and confirm your workspace plan change.
            </DialogDescription>
          </DialogHeader>
          {selectedPlanForUpgrade && (
            <div className='space-y-4 py-3'>
              <div className='rounded-lg border bg-muted/30 p-4 space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='font-semibold'>{selectedPlanForUpgrade.name}</span>
                  <span className='font-bold text-lg'>
                    ${isYearly ? selectedPlanForUpgrade.yearlyPrice : selectedPlanForUpgrade.monthlyPrice}
                    <span className='text-xs text-muted-foreground font-normal'>/month</span>
                  </span>
                </div>
                <p className='text-xs text-muted-foreground'>{selectedPlanForUpgrade.description}</p>
                {isYearly && selectedPlanForUpgrade.monthlyPrice > 0 && (
                  <Badge variant='outline' className='text-[10px] text-emerald-600 border-emerald-500/30'>
                    Billed annually (${selectedPlanForUpgrade.yearlyPrice * 12}/year)
                  </Badge>
                )}
              </div>

              <div className='space-y-1.5 text-xs text-muted-foreground'>
                <div className='flex justify-between'>
                  <span>Billing interval:</span>
                  <span className='font-medium text-foreground'>{isYearly ? 'Annual' : 'Monthly'}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Prorated charges today:</span>
                  <span className='font-medium text-foreground'>$0.00 (Mocked Sandbox)</span>
                </div>
                <div className='flex justify-between'>
                  <span>Payment card:</span>
                  <span className='font-medium text-foreground'>Visa •••• 4242</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpgrade} disabled={updatePlanMutation.isPending}>
              {updatePlanMutation.isPending ? 'Processing...' : 'Confirm Upgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CANCEL MODAL */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='size-5' />
              Downgrade to Free Plan?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your current subscription? Your workspace will lose access to premium limits at the end of the current billing cycle.
            </DialogDescription>
          </DialogHeader>
          <div className='rounded-lg bg-destructive/10 p-3 text-xs text-destructive space-y-1'>
            <p className='font-semibold'>Consequences of downgrading:</p>
            <ul className='list-disc list-inside space-y-0.5 text-destructive/90'>
              <li>Seat capacity reduced to 1 user</li>
              <li>Storage limit reduced to 500MB</li>
              <li>Webhook & audit retention disabled</li>
            </ul>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setIsCancelModalOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant='destructive' onClick={handleCancelSubscription} disabled={updatePlanMutation.isPending}>
              {updatePlanMutation.isPending ? 'Downgrading...' : 'Yes, Downgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  )
}
