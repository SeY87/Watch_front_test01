'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  name: string
  email: string
  phone: string
  organization: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('프로필 로딩 오류:', error)
        toast.error('프로필을 불러오는데 실패했습니다.')
      }
    }
    getProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          phone: profile.phone,
          organization: profile.organization,
        })
        .eq('id', profile.id)

      if (error) throw error
      toast.success('프로필이 업데이트되었습니다.')
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      toast.error('프로필 업데이트에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="container max-w-2xl py-6">
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
          <CardDescription>
            프로필 정보를 수정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">소속</Label>
              <Input
                id="organization"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 