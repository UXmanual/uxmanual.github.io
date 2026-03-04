<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white transition-colors duration-200">
    <!-- Navbar Component -->
    <SiteNavbar />

    <div class="pt-[60px]">
      <SiteBanner />
    </div>

    <SiteHeader 
      title="FEED" 
      description="뉴스보다 더 재밌는 우리들의 이야기 <br /> 함께 읽고, 함께 말해요!"
      padding-top="pt-16"
      margin-bottom="mb-16"
      inner-max-width="max-w-[680px] mx-auto"
    />

    <main class="px-6 md:px-10 max-w-[1800px] mx-auto pb-20">
      <div class="max-w-[680px] mx-auto">
      <!-- Input Area -->
      <div class="mb-20 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-white/5 rounded-2xl p-8">
        <div class="flex flex-col gap-6">
          <div class="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_0.8fr] gap-4">
            <input 
              v-model="newName" 
              type="text" 
              placeholder="이름" 
              class="w-full min-w-0 bg-zinc-50 dark:bg-black/50 border-2 border-zinc-200 dark:border-white/10 rounded-lg px-5 py-4 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all font-bold"
            >
            <input 
              v-model="newTitle" 
              type="text" 
              placeholder="제목" 
              class="w-full min-w-0 bg-zinc-50 dark:bg-black/50 border-2 border-zinc-200 dark:border-white/10 rounded-lg px-5 py-4 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all font-bold"
            >
            <input 
              v-model="newPassword" 
              type="password" 
              maxlength="4"
              placeholder="비밀번호 (4자리)" 
              class="w-full min-w-0 bg-zinc-50 dark:bg-black/50 border-2 border-zinc-200 dark:border-white/10 rounded-lg px-5 py-4 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all font-bold"
            >
          </div>
          <div class="relative">
            <textarea 
              ref="textareaRef"
              v-model="newMessage" 
              rows="5" 
              placeholder="내용을 입력해주세요..." 
              class="w-full bg-zinc-50 dark:bg-black/50 border-2 border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-5 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all resize-none leading-relaxed"
            ></textarea>
            
            <div class="absolute bottom-4 right-4 flex items-center gap-2 max-w-[calc(100%-2rem)]">
              <!-- Custom Emoji Bar -->
              <Transition name="fade-slide">
                <div v-if="showEmojiPicker" ref="emojiPickerRef" class="relative flex items-center bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-zinc-200 dark:border-white/10 shadow-none overflow-hidden">
                  <!-- Left mask -->
                  <div class="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-white/95 dark:from-zinc-900/90 to-transparent pointer-events-none z-10"></div>
                  
                  <div class="flex items-center gap-1 overflow-x-auto no-scrollbar px-4 py-1">
                    <button 
                      v-for="emoji in ['😊', '😂', '🤣', '😍', '👍', '🙌', '✨', '🔥', '👀', '🤔', '🎉', '❤️', '🙏', '😭', '😮']" 
                      :key="emoji"
                      type="button"
                      @click="addEmoji(emoji)"
                      class="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-95 text-lg"
                    >
                      {{ emoji }}
                    </button>
                  </div>

                  <!-- Right mask -->
                  <div class="absolute right-0 inset-y-0 w-6 bg-gradient-to-l from-white/95 dark:from-zinc-900/90 to-transparent pointer-events-none z-10"></div>
                </div>
              </Transition>

              <button 
                type="button"
                @click.stop="toggleEmojiPicker"
                class="shrink-0 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                :class="{ 'text-zinc-900 dark:text-white': showEmojiPicker }"
                title="이모지 선택"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex justify-end">
            <button 
              @click="addPost"
              :disabled="isPosting"
              class="w-full md:w-auto px-10 py-4 bg-zinc-900 hover:bg-zinc-700 text-white dark:bg-white hover:dark:bg-zinc-300 dark:text-black rounded-lg font-semibold text-base leading-normal tracking-tight active:scale-[0.98] transition-all duration-300 border border-transparent disabled:opacity-50 disabled:scale-100"
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
            class="group relative bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-8 transition-all duration-150 hover:border-zinc-800 dark:hover:border-zinc-500"
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
                <!-- Edit Button -->
                <button 
                  v-if="editingPostId !== post.id"
                  @click="startEdit(post)"
                  class="p-2 rounded-lg hover:bg-zinc-500/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all opacity-0 group-hover:opacity-100"
                  title="수정하기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  v-else
                  @click="saveEdit(post)"
                  class="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition-all animate-pulse"
                  title="저장하기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <!-- Delete Button -->
                <button 
                  @click="verifyAndDelete(post)"
                  class="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  title="게시물 삭제"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div v-if="editingPostId === post.id" class="space-y-4 animate-in">
              <input 
                v-model="tempEditTitle"
                class="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all font-bold"
                placeholder="제목을 입력하세요..."
              />
              <textarea 
                v-model="tempEditMessage"
                rows="4"
                class="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 transition-all resize-none leading-relaxed"
                placeholder="내용을 입력하세요..."
              ></textarea>
              <div class="flex justify-end gap-3 mt-2">
                <button @click="editingPostId = null" class="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">취소</button>
                <button @click="saveEdit(post)" class="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold">수정 완료</button>
              </div>
            </div>
            <template v-else>
              <h4 v-if="post.title" class="text-lg font-bold mb-3 text-zinc-800 dark:text-zinc-200 tracking-tight">{{ post.title }}</h4>
              <p 
                class="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line"
                v-html="linkify(post.message)"
              ></p>
            </template>
          </div>
        </TransitionGroup>
      </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import SiteNavbar from '../components/SiteNavbar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteBanner from '../components/SiteBanner.vue'
import CommunitySkeleton from '../components/CommunitySkeleton.vue'
import { supabase } from '../lib/supabaseClient'

const linkify = (text: string) => {
  if (!text) return ''
  
  // 1. Escape HTML to prevent XSS
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 2. Detect URLs and wrap them in <a> tags
  // Using a more robust regex to avoid picking up trailing punctuation
  const urlRegex = /(https?:\/\/[^\s<]+[^.,;?!\s<])/g;
  return escapedText.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 dark:text-blue-400 hover:underline break-all font-semibold">${url}</a>`;
  });
}

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
const showEmojiPicker = ref(false)
const emojiPickerRef = ref<HTMLElement | null>(null)
const isDarkMode = ref(document.documentElement.classList.contains('dark'))
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const editingPostId = ref<number | null>(null)
const tempEditTitle = ref('')
const tempEditMessage = ref('')

const posts = ref<Post[]>([])

// Watch for dark mode changes
const observer = new MutationObserver(() => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
})

// Fetch posts from Supabase
const fetchPosts = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
    } else {
      posts.value = data || []
    }
  } catch (err) {
    console.error('Supabase fetch error:', err)
  } finally {
    isLoading.value = false
  }
}

const addEmoji = (emoji: string) => {
  if (textareaRef.value) {
    const el = textareaRef.value
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = newMessage.value
    const scrollTop = el.scrollTop
    
    newMessage.value = text.substring(0, start) + emoji + text.substring(end)
    
    // Set selection back
    nextTick(() => {
      el.focus()
      const newPos = start + emoji.length
      el.setSelectionRange(newPos, newPos)
      el.scrollTop = scrollTop
    })
  } else {
    newMessage.value += emoji
  }
  showEmojiPicker.value = false
}

const toggleEmojiPicker = (e: Event) => {
  e.stopPropagation()
  showEmojiPicker.value = !showEmojiPicker.value
}

const handleClickOutside = (e: MouseEvent) => {
  if (emojiPickerRef.value && !emojiPickerRef.value.contains(e.target as Node)) {
    showEmojiPicker.value = false
  }
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

const startEdit = (post: Post) => {
  const input = prompt('게시물을 수정하려면 숫자 4자리 비밀번호를 입력하세요:')
  if (input === null) return
  
  if (input === post.password) {
    editingPostId.value = post.id
    tempEditTitle.value = post.title
    tempEditMessage.value = post.message
  } else {
    alert('비밀번호가 일치하지 않습니다.')
  }
}

const saveEdit = async (post: Post) => {
  if (!tempEditTitle.value || !tempEditMessage.value) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }
  
  const { error } = await supabase
    .from('posts')
    .update({ 
      title: tempEditTitle.value, 
      message: tempEditMessage.value 
    })
    .eq('id', post.id)

  if (error) {
    alert('게시물 수정 중 오류가 발생했습니다.')
    console.error(error)
  } else {
    editingPostId.value = null
    await fetchPosts()
  }
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
  window.addEventListener('click', handleClickOutside)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  observer.disconnect()
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(5px);
}
</style>

<style>
/* Custom styles for vue3-emoji-picker */
.v3-emoji-picker-custom {
  --v3-spacing: 12px;
  background: white !important;
  border: none !important;
  font-family: inherit !important;
}

.dark .v3-emoji-picker-custom {
  background: #18181b !important; /* zinc-900 */
}

.v3-emoji-picker-custom .v3-header,
.v3-emoji-picker-custom .v3-footer {
  border-color: rgba(0, 0, 0, 0.05) !important;
}

.dark .v3-emoji-picker-custom .v3-header,
.dark .v3-emoji-picker-custom .v3-footer {
  border-color: rgba(255, 255, 255, 0.05) !important;
}

.animate-in {
  animation: animate-in 0.2s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Adjust for mobile */
@media (max-width: 640px) {
  .v3-emoji-picker-custom {
    width: 280px !important;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
