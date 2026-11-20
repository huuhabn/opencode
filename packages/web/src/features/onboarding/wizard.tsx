import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Building2,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function OnboardingWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1: Workspace setup
  const [workspaceName, setWorkspaceName] = useState('Acme Corporation')
  const [organizationType, setOrganizationType] = useState('team')

  // Step 2: Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<'sandbox' | 'pro'>('pro')

  // Step 3: Inviting teammates
  const [inviteEmails, setInviteEmails] = useState(['alex@example.com', ''])

  const handleNext = () => {
    if (step === 1 && !workspaceName.trim()) {
      toast.error('Please enter a workspace name')
      return
    }
    if (step < 4) {
      setStep((prev) => (prev + 1) as typeof step)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as typeof step)
    }
  }

  const handleComplete = () => {
    toast.success('Workspace initialization complete! Welcome aboard.')
    navigate({ to: '/' })
  }

  const progressPercent = (step / 4) * 100

  return (
    <div className='min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 sm:p-8'>
      <div className='w-full max-w-2xl space-y-6'>
        {/* Header Branding */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='rounded-lg bg-primary p-2 text-primary-foreground'>
              <Layers className='size-5' />
            </div>
            <div>
              <h1 className='text-lg font-bold'>SaaS React Starter</h1>
              <p className='text-xs text-muted-foreground'>Workspace Setup Wizard</p>
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='text-xs text-muted-foreground'
            onClick={() => navigate({ to: '/' })}
          >
            Skip for now
          </Button>
        </div>

        {/* Stepper Progress Bar */}
        <div className='space-y-2'>
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span className={step >= 1 ? 'font-semibold text-primary' : ''}>1. Workspace</span>
            <span className={step >= 2 ? 'font-semibold text-primary' : ''}>2. Plan</span>
            <span className={step >= 3 ? 'font-semibold text-primary' : ''}>3. Team</span>
            <span className={step >= 4 ? 'font-semibold text-primary' : ''}>4. Launch</span>
          </div>
          <Progress value={progressPercent} className='h-2' />
        </div>

        {/* STEP CARDS */}
        <Card className='shadow-md border-border'>
          {/* STEP 1: WORKSPACE PROFILE */}
          {step === 1 && (
            <>
              <CardHeader>
                <div className='flex items-center gap-2 text-primary text-sm font-semibold mb-1'>
                  <Building2 className='size-4' /> Step 1 of 4
                </div>
                <CardTitle className='text-2xl'>Name your workspace</CardTitle>
                <CardDescription>
                  Your workspace is where your team collaborates on products, tasks, and configurations.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='ws-name'>Workspace Name</Label>
                  <Input
                    id='ws-name'
                    placeholder='e.g. Acme Studio'
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>

                <div className='space-y-2 pt-2'>
                  <Label>Organization Type</Label>
                  <RadioGroup
                    value={organizationType}
                    onValueChange={setOrganizationType}
                    className='grid grid-cols-1 sm:grid-cols-2 gap-3'
                  >
                    <label className='flex items-start gap-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/30 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5'>
                      <RadioGroupItem value='personal' className='mt-1' />
                      <div className='space-y-0.5'>
                        <p className='font-semibold text-sm'>Solo / Independent</p>
                        <p className='text-xs text-muted-foreground'>For single developers and hobby projects</p>
                      </div>
                    </label>
                    <label className='flex items-start gap-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/30 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5'>
                      <RadioGroupItem value='team' className='mt-1' />
                      <div className='space-y-0.5'>
                        <p className='font-semibold text-sm'>Company or Team</p>
                        <p className='text-xs text-muted-foreground'>For multiple members, RBAC, and shared quota</p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 2: PLAN SELECTION */}
          {step === 2 && (
            <>
              <CardHeader>
                <div className='flex items-center gap-2 text-primary text-sm font-semibold mb-1'>
                  <Sparkles className='size-4' /> Step 2 of 4
                </div>
                <CardTitle className='text-2xl'>Choose your initial tier</CardTitle>
                <CardDescription>
                  You can change or cancel your subscription anytime from the workspace settings.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* Sandbox Plan */}
                  <div
                    onClick={() => setSelectedPlan('sandbox')}
                    className={`rounded-lg border p-4 cursor-pointer transition-all space-y-2 ${
                      selectedPlan === 'sandbox'
                        ? 'border-primary ring-1 ring-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className='flex justify-between items-center'>
                      <h3 className='font-bold text-base'>Starter</h3>
                      <span className='font-bold text-lg'>$19<span className='text-xs text-muted-foreground'>/mo</span></span>
                    </div>
                    <p className='text-xs text-muted-foreground'>Essential features for launching products quickly.</p>
                    <ul className='text-xs space-y-1 text-muted-foreground pt-2 border-t'>
                      <li>• Up to 3 Workspace Seats</li>
                      <li>• 10GB Cloud Storage</li>
                      <li>• 50,000 monthly API calls</li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div
                    onClick={() => setSelectedPlan('pro')}
                    className={`rounded-lg border p-4 cursor-pointer transition-all space-y-2 relative ${
                      selectedPlan === 'pro'
                        ? 'border-primary ring-1 ring-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className='absolute -top-2.5 right-3'>
                      <Badge className='text-[10px] bg-primary text-primary-foreground'>Recommended</Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-bold text-base'>Professional</h3>
                      <span className='font-bold text-lg'>$79<span className='text-xs text-muted-foreground'>/mo</span></span>
                    </div>
                    <p className='text-xs text-muted-foreground'>Full power, higher bandwidth, and priority 24/7 SLA.</p>
                    <ul className='text-xs space-y-1 text-muted-foreground pt-2 border-t'>
                      <li>• Up to 10 Workspace Seats</li>
                      <li>• 50GB Cloud Storage</li>
                      <li>• 500,000 monthly API calls</li>
                      <li>• Webhooks & Audit Trail retention</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 3: INVITE TEAM */}
          {step === 3 && (
            <>
              <CardHeader>
                <div className='flex items-center gap-2 text-primary text-sm font-semibold mb-1'>
                  <Users className='size-4' /> Step 3 of 4
                </div>
                <CardTitle className='text-2xl'>Invite your teammates</CardTitle>
                <CardDescription>
                  Invite colleagues to collaborate in {workspaceName}. They will receive an email invite link.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                {inviteEmails.map((email, idx) => (
                  <div key={idx} className='space-y-1'>
                    <Label className='text-xs'>Teammate #{idx + 1} Email</Label>
                    <Input
                      placeholder='colleague@company.com'
                      value={email}
                      onChange={(e) => {
                        const copy = [...inviteEmails]
                        copy[idx] = e.target.value
                        setInviteEmails(copy)
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setInviteEmails((prev) => [...prev, ''])}
                  className='text-xs'
                >
                  + Add another invitation
                </Button>
              </CardContent>
            </>
          )}

          {/* STEP 4: SUMMARY & LAUNCH */}
          {step === 4 && (
            <>
              <CardHeader>
                <div className='flex items-center gap-2 text-primary text-sm font-semibold mb-1'>
                  <CheckCircle2 className='size-4 text-emerald-500' /> All Set!
                </div>
                <CardTitle className='text-2xl'>Ready to launch</CardTitle>
                <CardDescription>
                  Here is a summary of your workspace configuration. You are ready to start building.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg border bg-muted/20 p-4 space-y-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Workspace:</span>
                    <span className='font-bold'>{workspaceName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Selected Plan:</span>
                    <Badge variant='outline' className='capitalize text-primary font-semibold'>
                      {selectedPlan} Tier
                    </Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Invited Members:</span>
                    <span>{inviteEmails.filter((e) => e.trim()).length} members queued</span>
                  </div>
                  <div className='flex justify-between border-t pt-2'>
                    <span className='text-muted-foreground'>API Gateway & Webhooks:</span>
                    <span className='text-emerald-600 font-medium'>Initialized & Active</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* CARD FOOTER WITH NAVIGATION */}
          <CardFooter className='flex justify-between border-t pt-4 bg-muted/5'>
            {step > 1 ? (
              <Button variant='outline' onClick={handleBack} className='gap-1.5'>
                <ArrowLeft className='size-4' /> Back
              </Button>
            ) : (
              <div />
            )}

            <Button onClick={handleNext} className='gap-1.5'>
              {step === 4 ? (
                <>
                  Enter Dashboard <ArrowRight className='size-4' />
                </>
              ) : (
                <>
                  Continue <ArrowRight className='size-4' />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
