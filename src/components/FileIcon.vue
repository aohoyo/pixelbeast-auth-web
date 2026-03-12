<template>
  <div class="file-icon" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 文件夹 -->
    <svg v-if="file.type === 'folder'" viewBox="0 0 256 256" fill="currentColor">
      <path d="M216 72h-84.7L104 44.6A16 16 0 0091.3 36H40a16 16 0 00-16 16v144a16 16 0 0016 16h176a16 16 0 0016-16V88a16 16 0 00-16-16z" fill="#FFD54F"/>
    </svg>
    
    <!-- 图片 -->
    <svg v-else-if="file.fileType === 'image'" viewBox="0 0 256 256" fill="currentColor">
      <rect width="216" height="176" x="20" y="40" rx="16" fill="#E3F2FD"/>
      <circle cx="80" cy="100" r="16" fill="#1976D2"/>
      <path d="M28 176l48-48c12.1-12.1 31.9-12.1 44 0l20 20 40-40c12.1-12.1 31.9-12.1 44 0l48 48v24a16 16 0 01-16 16H44a16 16 0 01-16-16z" fill="#1976D2" opacity="0.3"/>
    </svg>
    
    <!-- PDF -->
    <svg v-else-if="file.fileType === 'pdf'" viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="176" x="40" y="40" rx="16" fill="#FFEBEE"/>
      <path d="M64 72h128v16H64zM64 112h128v16H64zM64 152h80v16H64z" fill="#D32F2F"/>
      <text x="160" y="168" font-size="32" fill="#D32F2F" font-weight="bold">PDF</text>
    </svg>
    
    <!-- Word -->
    <svg v-else-if="file.fileType === 'word' || file.name.endsWith('.doc') || file.name.endsWith('.docx')" viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="176" x="40" y="40" rx="16" fill="#E3F2FD"/>
      <path d="M64 72l24 96 24-96" stroke="#1976D2" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M88 128h48" stroke="#1976D2" stroke-width="12" stroke-linecap="round"/>
      <text x="152" y="160" font-size="28" fill="#1976D2" font-weight="bold">W</text>
    </svg>
    
    <!-- Excel -->
    <svg v-else-if="file.fileType === 'excel' || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')" viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="176" x="40" y="40" rx="16" fill="#E8F5E9"/>
      <rect x="56" y="64" width="32" height="32" fill="#388E3C"/>
      <rect x="96" y="64" width="32" height="32" fill="#388E3C"/>
      <rect x="56" y="104" width="32" height="32" fill="#388E3C"/>
      <rect x="96" y="104" width="32" height="32" fill="#388E3C"/>
      <text x="152" y="160" font-size="28" fill="#388E3C" font-weight="bold">X</text>
    </svg>
    
    <!-- PPT -->
    <svg v-else-if="file.fileType === 'ppt' || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')" viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="176" x="40" y="40" rx="16" fill="#FFF3E0"/>
      <circle cx="128" cy="128" r="40" fill="#F57C00"/>
      <path d="M128 88v-16" stroke="#F57C00" stroke-width="12" stroke-linecap="round"/>
      <text x="152" y="160" font-size="28" fill="#F57C00" font-weight="bold">P</text>
    </svg>
    
    <!-- 视频 -->
    <svg v-else-if="file.fileType === 'video'" viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="128" x="40" y="64" rx="16" fill="#F3E5F5"/>
      <path d="M100 100l48 28-48 28V100z" fill="#7B1FA2"/>
    </svg>
    
    <!-- 音频 -->
    <svg v-else-if="file.fileType === 'audio'" viewBox="0 0 256 256" fill="currentColor">
      <rect width="128" height="96" x="40" y="80" rx="16" fill="#E0F2F1"/>
      <path d="M168 104c17.7 0 32 14.3 32 32s-14.3 32-32 32" stroke="#00796B" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M168 72c35.3 0 64 28.7 64 64s-28.7 64-64 64" stroke="#00796B" stroke-width="12" fill="none" stroke-linecap="round"/>
    </svg>
    
    <!-- 代码文件 -->
    <svg v-else-if="file.fileType === 'code' || /\.(js|ts|jsx|tsx|vue|html|css|scss|less|py|java|go|php|ruby|swift|kt|rs)$/i.test(file.name)" viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="176" x="40" y="40" rx="16" fill="#ECEFF1"/>
      <path d="M80 96l-24 32 24 32" stroke="#455A64" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M176 96l24 32-24 32" stroke="#455A64" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M112 88l32 80" stroke="#455A64" stroke-width="12" fill="none" stroke-linecap="round"/>
    </svg>
    
    <!-- 压缩包 -->
    <svg v-else-if="file.fileType === 'archive' || /\.(zip|rar|7z|tar|gz|bz2|xz)$/i.test(file.name)" viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="176" x="40" y="40" rx="16" fill="#FFF8E1"/>
      <rect x="96" y="24" width="64" height="24" fill="#FBC02D"/>
      <rect x="104" y="56" width="48" height="16" fill="#FBC02D"/>
      <rect x="104" y="80" width="48" height="16" fill="#FBC02D"/>
      <rect x="104" y="104" width="48" height="16" fill="#FBC02D"/>
      <path d="M72 144h112" stroke="#FBC02D" stroke-width="12" stroke-linecap="round"/>
    </svg>
    
    <!-- 文本文件 -->
    <svg v-else-if="file.fileType === 'text' || file.name.endsWith('.txt')" viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="176" x="40" y="40" rx="16" fill="#FAFAFA"/>
      <path d="M64 72h128M64 112h128M64 152h80M64 192h48" stroke="#616161" stroke-width="8" stroke-linecap="round"/>
    </svg>
    
    <!-- 默认文件 -->
    <svg v-else viewBox="0 0 256 256" fill="currentColor">
      <rect width="176" height="176" x="40" y="40" rx="16" fill="#F5F5F5"/>
      <path d="M64 72h128M64 112h128M64 152h128" stroke="#9E9E9E" stroke-width="8" stroke-linecap="round"/>
      <circle cx="176" cy="176" r="24" fill="#9E9E9E"/>
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
