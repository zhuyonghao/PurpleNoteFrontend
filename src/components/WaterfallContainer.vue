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
        :style="{ animationDelay: `${index * 0.08}s` }"
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

const handleScroll = () => {
  if (!props.hasMore || isLoading) return

  const now = Date.now()
  if (now - lastTriggerTime < 1000) return

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

  if (scrollTop + clientHeight >= scrollHeight - 200) {
    isLoading = true
    lastTriggerTime = now
    emit('load-more')

    setTimeout(() => {
      isLoading = false
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
  if (props.scrollContainer) {
    scrollElement = document.querySelector(props.scrollContainer)
    if (!scrollElement) {
      scrollElement = window
    }
  } else {
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
.waterfall-container {
  column-count: auto;
  column-width: 280px;
  column-gap: 16px;
  padding: 0 6px;
}

.waterfall-item {
  break-inside: avoid;
  margin-bottom: 16px;
  opacity: 0;
  animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
