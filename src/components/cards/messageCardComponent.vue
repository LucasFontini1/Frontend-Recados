<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ImageLightbox from './ImageLightbox.vue'

const emit = defineEmits(['open-detail'])

const props = defineProps({
    message: {
        type: Object,
        required: true,
    },
})

const now = ref(new Date())
let clockInterval = null

onMounted(() => {
    clockInterval = window.setInterval(() => {
        now.value = new Date()
    }, 60_000)
})
onBeforeUnmount(() => {
    if (clockInterval) window.clearInterval(clockInterval)
})

const failedImage = ref('')
const imageViewerOpen = ref(false)
const imageUrl = computed(() => props.message.image?.url ?? '')
const hasImage = computed(() => imageUrl.value && failedImage.value !== imageUrl.value)
const pastoral = computed(() => props.message.pastoral)
const category = computed(() => props.message.category)

const eventDate = computed(() => {
    if (!props.message.event_date) return null
    const date = new Date(props.message.event_date)
    return Number.isNaN(date.getTime()) ? null : date
})
const eventStatus = computed(() => {
    if (!eventDate.value || eventDate.value > now.value) return ''

    const today = now.value.toDateString()
    if (eventDate.value.toDateString() === today) {
        return 'Está acontecendo hoje'
    }
    return 'Este evento já aconteceu'
})

const eventDay = computed(() =>
    eventDate.value
        ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
            .format(eventDate.value)
            .replace(/\./g, '')
            .toLocaleUpperCase('pt-BR')
        : '',
)
const eventTime = computed(() =>
    eventDate.value
        ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
            eventDate.value,
        )
        : '',
)
const publishedDate = computed(() => {
    if (!props.message.created_at) return ''
    const date = new Date(props.message.created_at)
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR')
})
</script>

<template>
    <article class="message-card">
        <div class="card-cover">
            <button
                v-if="hasImage"
                class="image-link"
                type="button"
                :aria-label="`Ampliar imagem de ${message.title}`"
                @click="imageViewerOpen = true"
            >
                <img :src="imageUrl" :alt="message.title" loading="lazy" @error="failedImage = imageUrl" />
            </button>
            <div v-else class="image-placeholder">
                <span class="placeholder-icon mdi mdi-auto-fix" aria-hidden="true"></span>
                <span>Evento sem imagem</span>
            </div>

            <span
                v-if="eventStatus"
                class="event-status"
                :class="{ 'event-status--past': eventStatus.includes('já aconteceu') }"
                role="status"
            >
                {{ eventStatus }}
            </span>

            <time v-if="eventDate" class="event-date" :datetime="message.event_date">
                <span class="mdi mdi-calendar-month-outline" aria-hidden="true"></span>
                <span>{{ eventDay }}</span>
                <span>{{ eventTime }}</span>
            </time>
        </div>

        <div class="card-content">
            <div class="card-tags">
                <span v-if="pastoral" class="tag pastoral-tag" :style="{ color: pastoral.color || undefined }"
                    :title="pastoral.name">
                    {{ pastoral.name }}
                </span>
                <span
                    v-if="category"
                    class="tag category-tag"
                    :style="{ '--category-color': category.color || '#009ee9' }"
                    :title="category.name"
                >
                    {{ category.name }}
                </span>
            </div>

            <h2 class="card-title" :title="message.title">{{ message.title }}</h2>
            <p class="card-description" :title="message.text">{{ message.text }}</p>

            <button class="detail-button" type="button" @click="emit('open-detail', message)">Ver detalhes <span class="mdi mdi-arrow-top-right" aria-hidden="true"></span></button>
            <footer class="card-footer">
                <span class="mdi mdi-bullhorn-outline" aria-hidden="true"></span>
                <span>{{ publishedDate ? `Publicado em ${publishedDate}` : 'Recado da comunidade' }}</span>
            </footer>
        </div>
    </article>
    <ImageLightbox
        :open="imageViewerOpen && Boolean(hasImage)"
        :src="imageUrl"
        :alt="message.title"
        @close="imageViewerOpen = false"
    />
</template>

<style scoped>
.message-card {
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 410px;
    overflow: hidden;
    border: 1px solid #d6e1df;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 3px 8px #163a2c12;
    color: #18332a;
    font-family: 'Comfortaa', sans-serif;
}

.card-cover {
    position: relative;
    flex: 0 0 158px;
    overflow: hidden;
    background: #d5f0fc;
}

.image-link {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: zoom-in;
}

.image-link:focus-visible {
    outline: 3px solid #008fc9;
    outline-offset: -3px;
}

.image-link img {
    display: block;
    width: 100%;
    height: 158px;
    object-fit: cover;
}

.image-placeholder {
    display: flex;
    position: relative;
    isolation: isolate;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 100%;
    padding: 16px;
    color: #008fce;
    font-size: 11px;
    font-weight: 600;
}

.image-placeholder::before,
.image-placeholder::after {
    position: absolute;
    z-index: -1;
    width: 210px;
    height: 210px;
    border: 25px solid #bfe7f7;
    border-radius: 50%;
    content: '';
}

.image-placeholder::before {
    bottom: -150px;
    left: -15px;
}

.image-placeholder::after {
    top: -100px;
    right: -55px;
}

.placeholder-icon {
    display: grid;
    width: 44px;
    height: 44px;
    place-items: center;
    border: 1px solid #acdef4;
    border-radius: 50%;
    background: #eaf8ff;
    font-size: 23px;
}

.event-status {
    position: absolute;
    z-index: 1;
    top: 12px;
    right: 12px;
    max-width: calc(100% - 24px);
    padding: 7px 10px;
    border-radius: 6px;
    background: #0a6a4c;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.45;
    text-align: center;
    box-shadow: 0 2px 7px #18332a33;
}

.event-status--past {
    background: #745a24;
}

.event-date {
    position: absolute;
    bottom: 12px;
    left: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: calc(100% - 24px);
    padding: 9px 12px;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 2px 5px #18332a12;
    font-size: 11px;
    font-weight: 700;
}

.event-date .mdi,
.card-footer .mdi {
    flex-shrink: 0;
    color: #0a6a4c;
    font-size: 15px;
}

.card-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 18px 20px 14px;
}

.card-tags {
    display: flex;
    flex: 0 0 25px;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
    margin-bottom: 12px;
}

.tag {
    min-width: 0;
    overflow: hidden;
    padding: 6px 8px;
    border: 1px solid transparent;
    border-radius: 4px;
    color: #009ee9;
    font-size: 9px;
    font-weight: 700;
    line-height: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pastoral-tag {
    border-color: currentColor;
}

.category-tag {
    border-color: var(--category-color);
    color: var(--category-color);
    background: #f5f9f7;
}

.card-title,
.card-description {
    display: -webkit-box;
    flex-shrink: 0;
    overflow: hidden;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
}

.card-title {
    max-height: 44px;
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
}

.card-description {
    max-height: 42px;
    margin: 0;
    color: #647273;
    font-size: 12px;
    line-height: 21px;
    white-space: pre-line;
}

.card-footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    margin-top: 0;
    padding-top: 12px;
    border-top: 1px solid #d6e1df;
    color: #647273;
    font-size: 11px;
}

.card-footer>span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.detail-button {
    display: flex;
    align-items: center;
    gap: 5px;
    width: fit-content;
    margin-top: auto;
    margin-bottom: 8px;
    padding: 5px 0;
    border: 0;
    background: transparent;
    color: #0a6a4c;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
}

.detail-button:hover {
    text-decoration: underline;
}

.detail-button:focus-visible {
    outline: 2px solid #0a6a4c;
    outline-offset: 3px;
    border-radius: 3px;
}


</style>
