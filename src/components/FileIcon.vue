<template>
  <div class="file-icon" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 文件夹 -->
    <svg v-if="file.type === 'folder'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7C3 5.89543 3.89543 5 5 5H8.5L10.5 8H19C20.1046 8 21 8.89543 21 10V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" fill="#FFD54F"/>
      <path d="M3 7C3 5.89543 3.89543 5 5 5H8.5L10.5 8H19C20.1046 8 21 8.89543 21 10V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="#F9A825" stroke-width="1.5"/>
      <path d="M3 8H21" stroke="#F9A825" stroke-width="1.5"/>
    </svg>
    
    <!-- 图片 -->
    <svg v-else-if="file.fileType === 'image'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#E3F2FD" stroke="#1976D2" stroke-width="1.5"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="#1976D2"/>
      <path d="M4 16L8 12L11 15L16 10L20 14V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16Z" fill="#1976D2" opacity="0.3"/>
    </svg>
    
    <!-- PDF -->
    <svg v-else-if="file.fileType === 'pdf'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#FFEBEE" stroke="#D32F2F" stroke-width="1.5"/>
      <path d="M7 7H17V9H7V7Z" fill="#D32F2F"/>
      <path d="M7 11H17V13H7V11Z" fill="#D32F2F"/>
      <path d="M7 15H13V17H7V15Z" fill="#D32F2F"/>
      <text x="14" y="17" font-size="6" fill="#D32F2F" font-weight="bold">PDF</text>
    </svg>
    
    <!-- Word -->
    <svg v-else-if="file.fileType === 'word' || file.name.endsWith('.doc') || file.name.endsWith('.docx')" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#E3F2FD" stroke="#1976D2" stroke-width="1.5"/>
      <path d="M7 7L10 17L13 7" stroke="#1976D2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 13H15" stroke="#1976D2" stroke-width="1.5" stroke-linecap="round"/>
      <text x="14" y="16" font-size="5" fill="#1976D2" font-weight="bold">W</text>
    </svg>
    
    <!-- Excel -->
    <svg v-else-if="file.fileType === 'excel' || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#E8F5E9" stroke="#388E3C" stroke-width="1.5"/>
      <rect x="6" y="6" width="4" height="4" fill="#388E3C"/>
      <rect x="11" y="6" width="4" height="4" fill="#388E3C"/>
      <rect x="6" y="11" width="4" height="4" fill="#388E3C"/>
      <rect x="11" y="11" width="4" height="4" fill="#388E3C"/>
      <text x="14" y="17" font-size="5" fill="#388E3C" font-weight="bold">X</text>
    </svg>
    
    <!-- PPT -->
    <svg v-else-if="file.fileType === 'ppt' || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#FFF3E0" stroke="#F57C00" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4" fill="#F57C00"/>
      <path d="M12 8V6" stroke="#F57C00" stroke-width="1.5"/>
      <text x="14" y="17" font-size="5" fill="#F57C00" font-weight="bold">P</text>
    </svg>
    
    <!-- 视频 -->
    <svg v-else-if="file.fileType === 'video'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="#F3E5F5" stroke="#7B1FA2" stroke-width="1.5"/>
      <path d="M10 9L15 12L10 15V9Z" fill="#7B1FA2"/>
    </svg>
    
    <!-- 音频 -->
    <svg v-else-if="file.fileType === 'audio'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="14" height="12" rx="2" fill="#E0F2F1" stroke="#00796B" stroke-width="1.5"/>
      <path d="M17 10C18.6569 10 20 11.3431 20 13C20 14.6569 18.6569 16 17 16" stroke="#00796B" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M17 7C20.3137 7 23 9.68629 23 13C23 16.3137 20.3137 19 17 19" stroke="#00796B" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    
    <!-- 代码文件 -->
    <svg v-else-if="file.fileType === 'code' || /\.(js|ts|jsx|tsx|vue|html|css|scss|less|py|java|go|php|ruby|swift|kt|rs)$/i.test(file.name)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#ECEFF1" stroke="#455A64" stroke-width="1.5"/>
      <path d="M8 9L5 12L8 15" stroke="#455A64" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 9L19 12L16 15" stroke="#455A64" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 8L13 16" stroke="#455A64" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    
    <!-- 压缩包 -->
    <svg v-else-if="file.fileType === 'archive' || /\.(zip|rar|7z|tar|gz|bz2|xz)$/i.test(file.name)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#FFF8E1" stroke="#FBC02D" stroke-width="1.5"/>
      <rect x="9" y="2" width="6" height="3" fill="#FBC02D"/>
      <rect x="10" y="6" width="4" height="2" fill="#FBC02D"/>
      <rect x="10" y="10" width="4" height="2" fill="#FBC02D"/>
      <rect x="10" y="14" width="4" height="2" fill="#FBC02D"/>
      <path d="M7 18H17" stroke="#FBC02D" stroke-width="1.5"/>
    </svg>
    
    <!-- 文本文件 -->
    <svg v-else-if="file.fileType === 'text' || file.name.endsWith('.txt')" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#FAFAFA" stroke="#616161" stroke-width="1.5"/>
      <path d="M7 7H17" stroke="#616161" stroke-width="1.5"/>
      <path d="M7 11H17" stroke="#616161" stroke-width="1.5"/>
      <path d="M7 15H13" stroke="#616161" stroke-width="1.5"/>
      <path d="M7 19H10" stroke="#616161" stroke-width="1.5"/>
    </svg>
    
    <!-- 默认文件 -->
    <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#F5F5F5" stroke="#9E9E9E" stroke-width="1.5"/>
      <path d="M7 7H17" stroke="#9E9E9E" stroke-width="1.5"/>
      <path d="M7 11H17" stroke="#9E9E9E" stroke-width="1.5"/>
      <path d="M7 15H17" stroke="#9E9E9E" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="3" fill="#9E9E9E"/>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  file: {
    type: Object,
    required: true
  },
  size: {
    type: Number,
    default: 48
  }
})
</script>

<style scoped>
.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon svg {
  width: 100%;
  height: 100%;
}
</style>
