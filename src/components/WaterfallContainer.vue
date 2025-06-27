<template>
  <div class="max-w-6xl mx-auto px-4">
    <div 
      ref="containerRef"
      class="waterfall-container"
    >
      <div 
        v-for="(item, index) in items" 
        :key="getItemKey(item, index)"
        class="waterfall-item"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  hasMore: {
    type: Boolean,
    default: true
  },
  itemKey: {
    type: String,
    default: 'id'
  },
  // 新增：指定滚动容器选择器
  scrollContainer: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['load-more'])
const containerRef = ref(null)
let isLoading = false
let lastTriggerTime = 0
let scrollElement = null

const getItemKey = (item, index) => {
  return item[props.itemKey] || index
}

// 监听滚动事件
const handleScroll = () => {
  console.log('滚动事件触发', {
    hasMore: props.hasMore,
    isLoading,
    scrollElement: scrollElement === window ? 'window' : 'container'
  })
  
  if (!props.hasMore || isLoading) {
    console.log('跳过加载更多:', { hasMore: props.hasMore, isLoading })
    return
  }
  
  const now = Date.now()
  if (now - lastTriggerTime < 1000) {
    console.log('防抖跳过，距离上次触发时间:', now - lastTriggerTime)
    return
  }
  
  let scrollTop, scrollHeight, clientHeight
  
  if (scrollElement === window) {
    scrollTop = document.documentElement.scrollTop
    scrollHeight = document.documentElement.scrollHeight
    clientHeight = document.documentElement.clientHeight
  } else {
    scrollTop = scrollElement.scrollTop
    scrollHeight = scrollElement.scrollHeight
    clientHeight = scrollElement.clientHeight
  }
  
  console.log('滚动位置信息:', {
    scrollTop,
    scrollHeight,
    clientHeight,
    distance: scrollHeight - (scrollTop + clientHeight),
    shouldTrigger: scrollTop + clientHeight >= scrollHeight - 200
  })
  
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    isLoading = true
    lastTriggerTime = now
    
    console.log('触发加载更多，当前时间:', now)
    emit('load-more')
    
    setTimeout(() => {
      isLoading = false
      console.log('重置加载状态')
    }, 2000)
  }
}

const throttle = (func, delay) => {
  let timeoutId
  let lastExecTime = 0
  return function (...args) {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(this, args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

const throttledScrollHandler = throttle(handleScroll, 300)

onMounted(() => {
  // 根据props决定监听哪个元素的滚动事件
  if (props.scrollContainer) {
    scrollElement = document.querySelector(props.scrollContainer)
    if (!scrollElement) {
      console.warn(`找不到滚动容器: ${props.scrollContainer}，使用window`)
      scrollElement = window
    }
  } else {
    // 自动查找最近的滚动容器
    let parent = containerRef.value?.parentElement
    while (parent) {
      const style = window.getComputedStyle(parent)
      if (style.overflow === 'auto' || style.overflowY === 'auto') {
        scrollElement = parent
        break
      }
      parent = parent.parentElement
    }
    
    if (!scrollElement) {
      scrollElement = window
    }
  }
  
  console.log('监听滚动元素:', scrollElement)
  scrollElement.addEventListener('scroll', throttledScrollHandler, { passive: true })
})

onUnmounted(() => {
  if (scrollElement) {
    scrollElement.removeEventListener('scroll', throttledScrollHandler)
  }
  isLoading = false
  lastTriggerTime = 0
})
</script>

<style scoped>
/* 瀑布流容器 */
.waterfall-container {
  column-count: auto;
  column-width: 300px;
  column-gap: 20px;
  padding: 0 10px;
}

.waterfall-item {
  break-inside: avoid;
  margin-bottom: 20px;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>