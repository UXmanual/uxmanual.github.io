<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white transition-colors duration-500">
    <!-- Navbar Component -->
    <SiteNavbar />

    <!-- Header Section -->
    <header class="pt-32 px-6 md:px-10 max-w-[1000px] mx-auto mb-16">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white">Community</h1>
      <p class="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed max-w-2xl">
        함께 읽고, 함께 말해요 <br class="hidden md:block">
        뉴스보다 더 재밌는 우리들의 이야기
      </p>
    </header>

    <main class="px-6 md:px-10 max-w-[1000px] mx-auto pb-40">
      <!-- Input Area -->
      <div class="mb-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-8">
        <div class="flex flex-col gap-6">
          <div class="flex flex-col md:flex-row gap-4">
            <input 
              v-model="newName" 
              type="text" 
              placeholder="Name" 
              class="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
            >
            <input 
              v-model="newTitle" 
              type="text" 
              placeholder="Subject (Optional)" 
              class="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
            >
            <input 
              v-model="newPassword" 
              type="password" 
              maxlength="4"
              placeholder="Pass (4 digits)" 
              class="flex-[0.5] bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
            >
          </div>
          <textarea 
            v-model="newMessage" 
            rows="4" 
            placeholder="Share your thoughts..." 
            class="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
          ></textarea>
          <div class="flex justify-end">
            <button 
              @click="addPost"
              :disabled="isPosting"
              class="px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {{ isPosting ? 'Posting...' : 'Post Message' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Messages List -->
      <div class="space-y-6">
        <CommunitySkeleton v-if="isLoading" />
        <TransitionGroup v-else name="list">
          <div v-for="post in posts" :key="post.id" 
            class="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 transition-all duration-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:ring-2 hover:ring-indigo-500/20"
          >
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs">
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SiteNavbar from '../components/SiteNavbar.vue'
import CommunitySkeleton from '../components/CommunitySkeleton.vue'
import { supabase } from '../lib/supabaseClient'

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
  if (!newName.value || !newMessage.value || !newPassword.value) {
    alert('Please enter your name, message, and a 4-digit password.')
    return
  }
  
  if (newPassword.value.length !== 4 || !/^\d+$/.test(newPassword.value)) {
    alert('Password must be exactly 4 digits.')
    return
  }

  isPosting.value = true
  
  const now = new Date()
  const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`
  
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
  const input = prompt('Enter the 4-digit password to delete this post:')
  if (input === null) return
  
  if (input === post.password) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    if (error) {
      alert('Error deleting post.')
      console.error(error)
    } else {
      await fetchPosts()
    }
  } else {
    alert('Incorrect password.')
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
