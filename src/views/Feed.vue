<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white transition-colors duration-500">
    <!-- Navbar Component -->
    <SiteNavbar />

    <SiteHeader 
      title="Feed" 
      description="뉴스보다 더 재밌는 우리들의 이야기 <br> 함께 읽고, 함께 말해요"
      padding-top="pt-32"
      margin-bottom="mb-16"
      inner-max-width="max-w-[680px] mx-auto"
    />

    <main class="px-6 md:px-10 max-w-[1800px] mx-auto pb-[120px]">
      <div class="max-w-[680px] mx-auto">
      <!-- Input Area -->
      <div class="mb-20 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-white/5 rounded-3xl p-8">
        <div class="flex flex-col gap-6">
          <div class="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_0.8fr] gap-4">
            <input 
              v-model="newName" 
              type="text" 
              placeholder="이름" 
              class="w-full min-w-0 bg-zinc-50 dark:bg-black/50 border-2 border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all font-bold"
            >
            <input 
              v-model="newTitle" 
              type="text" 
              placeholder="제목" 
              class="w-full min-w-0 bg-zinc-50 dark:bg-black/50 border-2 border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all font-bold"
            >
            <input 
              v-model="newPassword" 
              type="password" 
              maxlength="4"
              placeholder="비밀번호 (4자리)" 
              class="w-full min-w-0 bg-zinc-50 dark:bg-black/50 border-2 border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all font-bold"
            >
          </div>
          <textarea 
            v-model="newMessage" 
            rows="4" 
            placeholder="내용을 입력해주세요..." 
            class="w-full bg-zinc-50 dark:bg-black/50 border-2 border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all resize-none leading-relaxed px-5 py-4"
          ></textarea>
          <div class="flex justify-end">
            <button 
              @click="addPost"
              :disabled="isPosting"
              class="w-full md:w-auto px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {{ isPosting ? '게시 중...' : '피드 글쓰기' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Messages List -->
      <div class="space-y-6">
        <CommunitySkeleton v-if="isLoading" />
        <TransitionGroup v-else name="list">
          <div v-for="post in posts" :key="post.id" 
            class="group relative bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-8 transition-all duration-150 hover:border-zinc-800 dark:hover:border-zinc-500"
          >
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-4">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs"
                  :class="getAvatarGradient(post.id)"
                >
                  {{ post.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-black text-zinc-900 dark:text-white uppercase tracking-tight">{{ post.name }}</h3>
                  <span class="text-xs text-zinc-400">{{ post.date }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="verifyAndDelete(post)"
                  class="p-2 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Post"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <h4 v-if="post.title" class="text-lg font-bold mb-3 text-zinc-800 dark:text-zinc-200 tracking-tight">{{ post.title }}</h4>
            <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">{{ post.message }}</p>
          </div>
        </TransitionGroup>
      </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SiteNavbar from '../components/SiteNavbar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import SiteHeader from '../components/SiteHeader.vue'
import CommunitySkeleton from '../components/CommunitySkeleton.vue'
import { supabase } from '../lib/supabaseClient'

const getAvatarGradient = (id: number) => {
  const gradients = [
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-emerald-400 to-teal-600',
    'bg-gradient-to-br from-rose-400 to-pink-600',
    'bg-gradient-to-br from-amber-400 to-orange-600',
    'bg-gradient-to-br from-blue-400 to-cyan-600',
    'bg-gradient-to-br from-violet-400 to-fuchsia-600',
    'bg-gradient-to-br from-orange-400 to-red-600',
    'bg-gradient-to-br from-lime-400 to-green-600'
  ]
  return gradients[id % gradients.length]
}

interface Post {
  id: number
  name: string
  title: string
  message: string
  date: string
  password?: string // 4 digits
}

const newName = ref('')
const newTitle = ref('')
const newMessage = ref('')
const newPassword = ref('')
const isPosting = ref(false)
const isLoading = ref(true)

const posts = ref<Post[]>([])

// Fetch posts from Supabase
const fetchPosts = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
  } else {
    posts.value = data || []
  }
  isLoading.value = false
}

const addPost = async () => {
  if (!newName.value || !newTitle.value || !newMessage.value || !newPassword.value) {
    alert('이름, 제목, 내용, 그리고 4자리 비밀번호를 모두 입력해주세요.')
    return
  }
  
  if (newPassword.value.length !== 4 || !/^\d+$/.test(newPassword.value)) {
    alert('비밀번호는 반드시 숫자 4자리여야 합니다.')
    return
  }

  isPosting.value = true
  
  const now = new Date()
  const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  const newPost = {
    name: newName.value,
    title: newTitle.value,
    message: newMessage.value,
    date: dateStr,
    password: newPassword.value
  }

  const { error } = await supabase
    .from('posts')
    .insert([newPost])

  if (error) {
    alert('Error posting message. Please check if table is created.')
    console.error(error)
  } else {
    // Clear inputs and refetch
    newName.value = ''
    newTitle.value = ''
    newMessage.value = ''
    newPassword.value = ''
    await fetchPosts()
  }
  
  isPosting.value = false
}

const verifyAndDelete = async (post: Post) => {
  const input = prompt('게시물을 삭제하려면 숫자 4자리 비밀번호를 입력하세요:')
  if (input === null) return
  
  if (input === post.password) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    if (error) {
      alert('게시물 삭제 중 오류가 발생했습니다.')
      console.error(error)
    } else {
      await fetchPosts()
    }
  } else {
    alert('비밀번호가 일치하지 않습니다.')
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.6s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
