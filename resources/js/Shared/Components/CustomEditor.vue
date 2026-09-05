<template>
    <div
        class="custom-editor"
        :class="{ 'custom-editor--focused': isFocused, 'custom-editor--fullscreen': isFullscreen }"
    >
        <!-- Toolbar -->
        <div v-if="showToolbar" class="custom-editor__toolbar">
            <div class="toolbar-group">
                <!-- Text Formatting -->
                <button
                    type="button"
                    @click="execCommand('bold')"
                    :class="{ active: isActive('bold') }"
                    class="toolbar-btn"
                    title="Bold (Ctrl+B)"
                >
                    <Icon name="bold" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="execCommand('italic')"
                    :class="{ active: isActive('italic') }"
                    class="toolbar-btn"
                    title="Italic (Ctrl+I)"
                >
                    <Icon name="italic" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="execCommand('underline')"
                    :class="{ active: isActive('underline') }"
                    class="toolbar-btn"
                    title="Underline (Ctrl+U)"
                >
                    <Icon name="underline" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="execCommand('strikeThrough')"
                    :class="{ active: isActive('strikeThrough') }"
                    class="toolbar-btn"
                    title="Strikethrough"
                >
                    <Icon name="strikethrough" class="w-4 h-4" />
                </button>
            </div>

            <div class="toolbar-separator"></div>

            <div class="toolbar-group">
                <!-- Headers -->
                <select @change="formatBlock($event)" class="toolbar-select" title="Heading">
                    <option value="">{{ $t('Normal') }}</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="h5">Heading 5</option>
                    <option value="h6">Heading 6</option>
                    <option value="p">{{ $t('Paragraph') }}</option>
                </select>
            </div>

            <div class="toolbar-separator"></div>

            <div class="toolbar-group">
                <!-- Text Alignment -->
                <button
                    type="button"
                    @click="execCommand('justifyLeft')"
                    :class="{ active: isActive('justifyLeft') }"
                    class="toolbar-btn"
                    title="Align Left (Ctrl+Shift+L)"
                >
                    <Icon name="align-left" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="execCommand('justifyCenter')"
                    :class="{ active: isActive('justifyCenter') }"
                    class="toolbar-btn"
                    title="Align Center (Ctrl+Shift+E)"
                >
                    <Icon name="align-center" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="execCommand('justifyRight')"
                    :class="{ active: isActive('justifyRight') }"
                    class="toolbar-btn"
                    title="Align Right (Ctrl+Shift+R)"
                >
                    <Icon name="align-right" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="execCommand('justifyFull')"
                    :class="{ active: isActive('justifyFull') }"
                    class="toolbar-btn"
                    title="Justify (Ctrl+Shift+J)"
                >
                    <Icon name="align-justify" class="w-4 h-4" />
                </button>
            </div>

            <div class="toolbar-separator"></div>

            <div class="toolbar-group">
                <!-- Lists -->
                <button
                    type="button"
                    @click="execCommand('insertUnorderedList')"
                    :class="{ active: isActive('insertUnorderedList') }"
                    class="toolbar-btn"
                    title="Bullet List (Ctrl+Shift+8)"
                >
                    <Icon name="list-ul" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="execCommand('insertOrderedList')"
                    :class="{ active: isActive('insertOrderedList') }"
                    class="toolbar-btn"
                    title="Numbered List (Ctrl+Shift+7)"
                >
                    <Icon name="list-ol" class="w-4 h-4" />
                </button>
            </div>

            <div class="toolbar-separator"></div>

            <div class="toolbar-group">
                <!-- Content Insertion -->
                <button
                    type="button"
                    @click="triggerImageUpload"
                    :disabled="isImageUploading"
                    :class="['toolbar-btn', { loading: isImageUploading }]"
                    title="Insert Image (Ctrl+Shift+I)"
                >
                    <Icon name="image" class="w-4 h-4" />
                </button>
                <button type="button" @click="insertTable" class="toolbar-btn" title="Insert Table">
                    <Icon name="table" class="w-4 h-4" />
                </button>
                <button type="button" @click="insertHorizontalRule" class="toolbar-btn" title="Horizontal Rule">
                    <Icon name="minus" class="w-4 h-4" />
                </button>
            </div>

            <div class="toolbar-separator"></div>

            <div class="toolbar-group">
                <!-- Other -->
                <button type="button" @click="insertLink" class="toolbar-btn" title="Insert Link (Ctrl+K)">
                    <Icon name="link" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="toggleBlockquote"
                    :class="{ active: isActive('blockquote') }"
                    class="toolbar-btn"
                    title="Quote (Ctrl+Shift+>)"
                >
                    <Icon name="quote-left" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="clearFormatting"
                    class="toolbar-btn"
                    title="Clear Formatting (Ctrl+Shift+N)"
                >
                    <Icon name="eraser" class="w-4 h-4" />
                </button>
            </div>

            <div class="toolbar-separator"></div>

            <div class="toolbar-group">
                <button
                    type="button"
                    @click="showExportMenu = !showExportMenu"
                    class="toolbar-btn"
                    title="Export Content"
                >
                    <Icon name="download" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="showKeyboardShortcuts = !showKeyboardShortcuts"
                    class="toolbar-btn"
                    title="Keyboard Shortcuts (Ctrl+?)"
                >
                    <Icon name="keyboard" class="w-4 h-4" />
                </button>
                <button
                    ref="emojiButton"
                    type="button"
                    @click="toggleEmojiPicker"
                    class="toolbar-btn"
                    title="Insert Emoji"
                >
                    <Icon name="smile" class="w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Status Bar -->
        <div v-if="showStatusBar" id="editor-status" class="custom-editor__status" role="status" aria-live="polite">
            <div class="status-left">
                <span class="status-item" :title="`${wordCount} words`">
                    <Icon name="file-text" class="w-3 h-3" />
                    {{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}
                </span>
                <span class="status-item" :title="`${charCount} characters`">
                    <Icon name="type" class="w-3 h-3" />
                    {{ charCount }} {{ charCount === 1 ? 'char' : 'chars' }}
                </span>
                <span
                    v-if="readingTime > 0"
                    class="status-item"
                    :title="`Estimated reading time: ${readingTime} minutes`"
                >
                    <Icon name="clock" class="w-3 h-3" />
                    {{ readingTime }} min
                </span>
            </div>
            <div class="status-right">
                <span v-if="isAutoSaving" class="auto-save-status">
                    <Icon name="spinner" class="w-3 h-3 animate-spin" />
                    <span>{{ $t('Saving...') }}</span>
                </span>
                <span v-else-if="lastSaved" class="last-saved" :title="`Last saved: ${lastSaved}`">
                    <Icon name="check-circle" class="w-3 h-3" />
                    <span>Saved {{ lastSaved }}</span>
                </span>
                <span v-else class="status-ready">
                    <Icon name="edit" class="w-3 h-3" />
                    <span>{{ $t('Ready') }}</span>
                </span>
            </div>
        </div>

        <!-- Editor Content -->
        <div class="custom-editor__content-wrapper">
            <div
                ref="editor"
                class="prose pt-4 text-sm custom-editor__content"
                :contenteditable="!disabled"
                @input="onInput"
                @keydown="onKeydown"
                @keyup="onKeyup"
                @paste="onPaste"
                @focus="onFocus"
                @blur="onBlur"
                @click="onClick"
                @mouseup="onMouseUp"
                role="textbox"
                :aria-label="placeholder || 'Rich text editor'"
                :aria-multiline="true"
                :aria-describedby="showStatusBar ? 'editor-status' : undefined"
                tabindex="0"
            ></div>
        </div>

        <!-- Mention Dropdown -->
        <div v-if="showMentionDropdown" class="custom-editor__mentions">
            <div class="mentions-list">
                <div class="mentions-header">
                    <span class="mentions-title">{{ $t('Mention someone') }}</span>
                    <span class="mentions-count"
                        >{{ filteredUsers.length }} user{{ filteredUsers.length !== 1 ? 's' : '' }}</span
                    >
                </div>
                <div
                    v-for="(user, index) in filteredUsers"
                    :key="user.id"
                    :class="{ active: index === selectedMentionIndex }"
                    class="mention-item"
                    @click.stop="selectMention(user)"
                    @mousedown.prevent="selectMention(user)"
                    @mouseenter="selectedMentionIndex = index"
                    @mouseup.prevent="selectMention(user)"
                >
                    <div class="mention-avatar-container" @click.stop="selectMention(user)">
                        <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="mention-avatar" />
                        <div v-else class="mention-avatar-placeholder">
                            {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                    </div>
                    <div class="mention-info" @click.stop="selectMention(user)">
                        <div class="mention-name">{{ user.name }}</div>
                        <div class="mention-email">{{ user.email }}</div>
                    </div>
                    <div v-if="index === selectedMentionIndex" class="mention-selected">
                        <Icon name="check" class="w-4 h-4" />
                    </div>
                </div>
                <div v-if="filteredUsers.length === 0" class="mentions-empty">
                    <Icon name="user" class="w-5 h-5" />
                    <span>{{ $t('No users found') }}</span>
                </div>
            </div>
        </div>

        <!-- Emoji Picker -->
        <div v-if="showEmojiPicker" class="emoji-picker" :style="emojiPickerStyle" @click.stop>
            <div class="emoji-picker__header">
                <span>{{ $t('Choose an emoji') }}</span>
                <button @click="showEmojiPicker = false" class="emoji-picker__close">
                    <Icon name="times" class="w-4 h-4" />
                </button>
            </div>
            <div class="emoji-picker__content">
                <div v-for="emoji in emojiList" :key="emoji" @click="insertEmoji(emoji)" class="emoji-item">
                    {{ emoji }}
                </div>
            </div>
        </div>

        <!-- Mention Popover -->

        <!-- Image Controls -->
        <div
            v-if="showImageControls && selectedImage"
            class="image-controls"
            :style="{
                left: imageControlsPosition.x + 'px',
                top: imageControlsPosition.y + 'px',
            }"
        >
            <div class="image-controls__header">
                <span>{{ $t('Image Options') }}</span>
                <button @click="closeImageControls" class="image-controls__close">
                    <Icon name="times" class="w-4 h-4" />
                </button>
            </div>
            <div class="image-controls__content">
                <button @click="alignImage('left')" class="image-control-btn" title="Align Left">
                    <Icon name="align-left" class="w-4 h-4" />
                </button>
                <button @click="alignImage('center')" class="image-control-btn" title="Align Center">
                    <Icon name="align-center" class="w-4 h-4" />
                </button>
                <button @click="alignImage('right')" class="image-control-btn" title="Align Right">
                    <Icon name="align-right" class="w-4 h-4" />
                </button>
                <div class="image-control-separator"></div>
                <button @click="resizeImage('small')" class="image-control-btn" title="Small Size">
                    <Icon name="resize-small" class="w-4 h-4" />
                </button>
                <button @click="resizeImage('medium')" class="image-control-btn" title="Medium Size">
                    <Icon name="resize-medium" class="w-4 h-4" />
                </button>
                <button @click="resizeImage('large')" class="image-control-btn" title="Large Size">
                    <Icon name="resize-large" class="w-4 h-4" />
                </button>
                <div class="image-control-separator"></div>
                <button @click="replaceImage" class="image-control-btn" title="Replace Image">
                    <Icon name="image" class="w-4 h-4" />
                </button>
                <button
                    @click="deleteSelectedImage"
                    class="image-control-btn image-control-btn--danger"
                    title="Delete Image"
                >
                    <Icon name="trash" class="w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Export Menu -->
        <div v-if="showExportMenu" class="export-menu">
            <div class="export-menu__header">
                <span>{{ $t('Export Content') }}</span>
                <button @click="showExportMenu = false" class="export-menu__close">
                    <Icon name="times" class="w-4 h-4" />
                </button>
            </div>
            <div class="export-menu__content">
                <button @click="exportContent('html')" class="export-btn">
                    <Icon name="code" class="w-4 h-4" />{{ $t('Export as HTML') }}
                </button>
                <button @click="exportContent('markdown')" class="export-btn">
                    <Icon name="file-text" class="w-4 h-4" />{{ $t('Export as Markdown') }}
                </button>
                <button @click="exportContent('text')" class="export-btn">
                    <Icon name="file" class="w-4 h-4" />{{ $t('Export as Plain Text') }}
                </button>
                <button @click="exportContent('pdf')" class="export-btn">
                    <Icon name="file-pdf" class="w-4 h-4" />{{ $t('Export as PDF') }}
                </button>
            </div>
        </div>

        <!-- Keyboard Shortcuts Overlay -->
        <div v-if="showKeyboardShortcuts" class="keyboard-shortcuts-overlay" @click="showKeyboardShortcuts = false">
            <div class="keyboard-shortcuts-modal" @click.stop>
                <div class="keyboard-shortcuts__header">
                    <h3>{{ $t('Keyboard Shortcuts') }}</h3>
                    <button @click="showKeyboardShortcuts = false" class="keyboard-shortcuts__close">
                        <Icon name="times" class="w-4 h-4" />
                    </button>
                </div>
                <div class="keyboard-shortcuts__content">
                    <div class="shortcut-section">
                        <h4>{{ $t('Text Formatting') }}</h4>
                        <div class="shortcut-item">
                            <kbd>Ctrl + B</kbd>
                            <span>{{ $t('Bold') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + I</kbd>
                            <span>{{ $t('Italic') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + U</kbd>
                            <span>{{ $t('Underline') }}</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h4>{{ $t('Alignment') }}</h4>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Shift + L</kbd>
                            <span>{{ $t('Align Left') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Shift + E</kbd>
                            <span>{{ $t('Align Center') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Shift + R</kbd>
                            <span>{{ $t('Align Right') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Shift + J</kbd>
                            <span>{{ $t('Justify') }}</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h4>Lists & Content</h4>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Shift + 8</kbd>
                            <span>{{ $t('Bullet List') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Shift + 7</kbd>
                            <span>{{ $t('Numbered List') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + K</kbd>
                            <span>{{ $t('Insert Link') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Shift + I</kbd>
                            <span>{{ $t('Insert Image') }}</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h4>{{ $t('Actions') }}</h4>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Z</kbd>
                            <span>{{ $t('Undo') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + Y</kbd>
                            <span>{{ $t('Redo') }}</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl + ?</kbd>
                            <span>{{ $t('Show Shortcuts') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Hidden file inputs -->
        <input ref="imageInput" type="file" accept="image/*" @change="handleImageUpload" style="display: none" />

        <!-- Notification Toast -->
        <transition name="notification">
            <div v-if="notification.show" :class="['notification', `notification--${notification.type}`]">
                <Icon
                    :name="
                        notification.type === 'success'
                            ? 'check-circle'
                            : notification.type === 'error'
                              ? 'exclamation-circle'
                              : 'info'
                    "
                    class="w-4 h-4"
                />
                <span>{{ notification.message }}</span>
            </div>
        </transition>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';

export default {
    name: 'CustomEditor',
    components: {
        Icon,
    },
    props: {
        modelValue: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: 'Start typing...',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        showToolbar: {
            type: Boolean,
            default: true,
        },
        showStatusBar: {
            type: Boolean,
            default: true,
        },
        enableAutoSave: {
            type: Boolean,
            default: true,
        },
        autoSaveInterval: {
            type: Number,
            default: 30000, // 30 seconds
        },
        users: {
            type: Array,
            default: () => [],
        },
    },
    emits: ['update:modelValue', 'focus', 'blur', 'mention'],
    data() {
        return {
            content: '',
            isFocused: false,
            showMentionDropdown: false,
            mentionQuery: '',
            selectedMentionIndex: 0,
            mentionStartPos: 0,
            history: [],
            historyIndex: -1,
            showEmojiPicker: false,
            showExportMenu: false,
            showKeyboardShortcuts: false,
            isFullscreen: false,
            isAutoSaving: false,
            lastSaved: null,
            autoSaveTimer: null,
            inputDebounceTimer: null,
            isTyping: false,
            selectedImage: null,
            showImageControls: false,
            imageControlsPosition: { x: 0, y: 0 },
            emojiPickerPosition: { top: 0, left: 0 },
            savedCursorPosition: null,
            isImageUploading: false,
            notification: { message: '', type: '', show: false },
            notificationTimer: null,
            toolbarStateCache: {},
            toolbarUpdateTimer: null,
            isExecutingCommand: false,
            emojiList: [
                '😀',
                '😃',
                '😄',
                '😁',
                '😆',
                '😅',
                '😂',
                '🤣',
                '😊',
                '😇',
                '🙂',
                '🙃',
                '😉',
                '😌',
                '😍',
                '🥰',
                '😘',
                '😗',
                '😙',
                '😚',
                '😋',
                '😛',
                '😝',
                '😜',
                '🤪',
                '🤨',
                '🧐',
                '🤓',
                '😎',
                '🤩',
                '🥳',
                '😏',
                '😒',
                '😞',
                '😔',
                '😟',
                '😕',
                '🙁',
                '☹️',
                '😣',
                '😖',
                '😫',
                '😩',
                '🥺',
                '😢',
                '😭',
                '😤',
                '😠',
                '😡',
                '🤬',
                '🤯',
                '😳',
                '🥵',
                '🥶',
                '😱',
                '😨',
                '😰',
                '😥',
                '😓',
                '🤗',
                '🤔',
                '🤭',
                '🤫',
                '🤥',
                '😶',
                '😐',
                '😑',
                '😬',
                '🙄',
                '😯',
                '😦',
                '😧',
                '😮',
                '😲',
                '🥱',
                '😴',
                '🤤',
                '😪',
                '😵',
                '🤐',
                '🥴',
                '🤢',
                '🤮',
                '🤧',
                '😷',
                '🤒',
                '🤕',
                '🤑',
                '🤠',
                '😈',
                '👿',
                '👹',
                '👺',
                '🤡',
                '💩',
                '👻',
                '💀',
                '☠️',
                '👽',
                '👾',
                '🤖',
                '🎃',
                '😺',
                '😸',
                '😹',
                '😻',
                '😼',
                '😽',
                '🙀',
                '😿',
                '😾',
                '👶',
                '🧒',
                '👦',
                '👧',
                '🧑',
                '👨',
                '👩',
                '🧓',
                '👴',
                '👵',
                '👤',
                '👥',
                '🫂',
                '👪',
                '👨‍👩‍👧',
                '👨‍👩‍👧‍👦',
                '👨‍👩‍👦‍👦',
                '👨‍👩‍👧‍👧',
                '👨‍👨‍👦',
                '👨‍👨‍👧',
                '👨‍👨‍👧‍👦',
                '👨‍👨‍👦‍👦',
                '👨‍👨‍👧‍👧',
                '👩‍👩‍👦',
                '👩‍👩‍👧',
                '👩‍👩‍👧‍👦',
                '👩‍👩‍👦‍👦',
                '👩‍👩‍👧‍👧',
                '👨‍👦',
                '👨‍👦‍👦',
                '👨‍👧',
                '👨‍👧‍👦',
                '👨‍👧‍👧',
                '👩‍👦',
                '👩‍👦‍👦',
                '👩‍👧',
                '👩‍👧‍👦',
                '👩‍👧‍👧',
                '🗣️',
                '👤',
                '👥',
                '🫂',
                '👋',
                '🤚',
                '🖐️',
                '✋',
                '🖖',
                '👌',
                '🤌',
                '🤏',
                '✌️',
                '🤞',
                '🤟',
                '🤘',
                '🤙',
                '👈',
                '👉',
                '👆',
                '🖕',
                '👇',
                '☝️',
                '👍',
                '👎',
                '✊',
                '👊',
                '🤛',
                '🤜',
                '👏',
                '🙌',
                '👐',
                '🤲',
                '🤝',
                '🙏',
                '✍️',
                '💅',
                '🤳',
                '💪',
                '🦾',
                '🦿',
                '🦵',
                '🦶',
                '👂',
                '🦻',
                '👃',
                '🧠',
                '🦷',
                '🦴',
                '👀',
                '👁️',
                '👅',
                '👄',
                '💋',
                '🩸',
                '❤️',
                '🧡',
                '💛',
                '💚',
                '💙',
                '💜',
                '🖤',
                '🤍',
                '🤎',
                '💔',
                '❣️',
                '💕',
                '💞',
                '💓',
                '💗',
                '💖',
                '💘',
                '💝',
                '💟',
                '☮️',
                '✝️',
                '☪️',
                '🕉️',
                '☸️',
                '✡️',
                '🔯',
                '🕎',
                '☯️',
                '☦️',
                '🛐',
                '⛎',
                '♈',
                '♉',
                '♊',
                '♋',
                '♌',
                '♍',
                '♎',
                '♏',
                '♐',
                '♑',
                '♒',
                '♓',
                '🆔',
                '⚛️',
                '🉑',
                '☢️',
                '☣️',
                '📴',
                '📳',
                '🈶',
                '🈚',
                '🈸',
                '🈺',
                '🈷️',
                '✴️',
                '🆚',
                '💮',
                '🉐',
                '㊙️',
                '㊗️',
                '🈴',
                '🈵',
                '🈹',
                '🈲',
                '🅰️',
                '🅱️',
                '🆎',
                '🆑',
                '🅾️',
                '🆘',
                '❌',
                '⭕',
                '🛑',
                '⛔',
                '📛',
                '🚫',
                '💯',
                '💢',
                '♨️',
                '🚷',
                '🚯',
                '🚳',
                '🚱',
                '🔞',
                '📵',
                '🚭',
                '❗',
                '❕',
                '❓',
                '❔',
                '‼️',
                '⁉️',
                '🔅',
                '🔆',
                '〽️',
                '⚠️',
                '🚸',
                '🔱',
                '⚜️',
                '🔰',
                '♻️',
                '✅',
                '🈯',
                '💹',
                '❇️',
                '✳️',
                '❎',
                '🌐',
                '💠',
                'Ⓜ️',
                '🌀',
                '💤',
                '🏧',
                '🚾',
                '♿',
                '🅿️',
                '🈳',
                '🈂️',
                '🛂',
                '🛃',
                '🛄',
                '🛅',
                '🚹',
                '🚺',
                '🚼',
                '🚻',
                '🚮',
                '🎦',
                '📶',
                '🈁',
                '🔣',
                '🔤',
                '🔡',
                '🔠',
                '🆖',
                '🆗',
                '🆙',
                '🆒',
                '🆕',
                '🆓',
                '0️⃣',
                '1️⃣',
                '2️⃣',
                '3️⃣',
                '4️⃣',
                '5️⃣',
                '6️⃣',
                '7️⃣',
                '8️⃣',
                '9️⃣',
                '🔟',
                '🔢',
                '#️⃣',
                '*️⃣',
                '⏏️',
                '▶️',
                '⏸️',
                '⏯️',
                '⏹️',
                '⏺️',
                '⏭️',
                '⏮️',
                '⏩',
                '⏪',
                '⏫',
                '⏬',
                '◀️',
                '🔼',
                '🔽',
                '➡️',
                '⬅️',
                '⬆️',
                '⬇️',
                '↗️',
                '↘️',
                '↙️',
                '↖️',
                '↕️',
                '↔️',
                '↩️',
                '↪️',
                '⤴️',
                '⤵️',
                '🔃',
                '🔄',
                '🔙',
                '🔚',
                '🔛',
                '🔜',
                '🔝',
                '🛐',
                '⚛️',
                '🕉️',
                '✡️',
                '☸️',
                '☯️',
                '✝️',
                '☦️',
                '☪️',
                '☮️',
                '🕎',
                '🔯',
                '♈',
                '♉',
                '♊',
                '♋',
                '♌',
                '♍',
                '♎',
                '♏',
                '♐',
                '♑',
                '♒',
                '♓',
                '⛎',
            ],
        };
    },
    computed: {
        filteredUsers() {
            if (!this.mentionQuery) return this.users.slice(0, 5);
            return this.users
                .filter(
                    (user) =>
                        user.name.toLowerCase().includes(this.mentionQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(this.mentionQuery.toLowerCase())
                )
                .slice(0, 5);
        },

        emojiPickerStyle() {
            return {
                position: 'absolute',
                top: `${this.emojiPickerPosition.top}px`,
                left: `${this.emojiPickerPosition.left}px`,
                zIndex: 1000,
            };
        },

        wordCount() {
            if (!this.content) return 0;
            const text = this.content.replace(/<[^>]*>/g, '').trim();
            return text ? text.split(/\s+/).length : 0;
        },

        charCount() {
            if (!this.content) return 0;
            return this.content.replace(/<[^>]*>/g, '').length;
        },

        readingTime() {
            const wordsPerMinute = 200;
            const minutes = Math.ceil(this.wordCount / wordsPerMinute);
            return minutes;
        },
    },
    mounted() {
        // Initialize content in the editor
        if (this.$refs.editor) {
            this.$refs.editor.innerHTML = this.content || '';
        }
        this.saveToHistory();
        this.startAutoSave();

        // Set global reference for table deletion
        window.customEditorInstance = this;

        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        document.addEventListener('keydown', this.handleGlobalKeydown);
        document.addEventListener('selectionchange', this.onSelectionChange);
    },
    beforeUnmount() {
        this.stopAutoSave();
        if (this.inputDebounceTimer) {
            clearTimeout(this.inputDebounceTimer);
        }
        if (this.notificationTimer) {
            clearTimeout(this.notificationTimer);
        }
        if (this.toolbarUpdateTimer) {
            clearTimeout(this.toolbarUpdateTimer);
        }

        // Remove selection change listener
        document.removeEventListener('selectionchange', this.onSelectionChange);

        // Clean up global reference
        if (window.customEditorInstance === this) {
            window.customEditorInstance = null;
        }

        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('keydown', this.handleGlobalKeydown);
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(newValue) {
                // Only update if the content is actually different
                if (newValue !== this.content) {
                    this.content = newValue || '';
                    this.$nextTick(() => {
                        if (this.$refs.editor && this.$refs.editor.innerHTML !== this.content) {
                            this.$refs.editor.innerHTML = this.content;
                        }
                    });
                }
            },
        },
    },
    methods: {
        onInput(event) {
            // Don't interfere with natural typing - just update content
            this.content = event.target.innerHTML;
            this.isTyping = true;

            // Clear existing debounce timer
            if (this.inputDebounceTimer) {
                clearTimeout(this.inputDebounceTimer);
            }

            // Debounce the update to improve performance
            this.inputDebounceTimer = setTimeout(() => {
                this.$emit('update:modelValue', this.content);
                this.saveToHistory();
                this.isTyping = false;
            }, 300);

            this.handleMentions();
        },

        onKeydown(event) {
            // Handle keyboard shortcuts
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'b':
                        event.preventDefault();
                        this.execCommand('bold');
                        break;
                    case 'i':
                        event.preventDefault();
                        this.execCommand('italic');
                        break;
                    case 'u':
                        event.preventDefault();
                        this.execCommand('underline');
                        break;
                    case 'k':
                        event.preventDefault();
                        this.insertLink();
                        break;
                    case 'z':
                        if (event.shiftKey) {
                            event.preventDefault();
                            this.redo();
                        } else {
                            event.preventDefault();
                            this.undo();
                        }
                        break;
                    case '?':
                        event.preventDefault();
                        this.showKeyboardShortcuts = !this.showKeyboardShortcuts;
                        break;
                }
            }

            // Handle Ctrl+Shift shortcuts
            if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
                switch (event.key) {
                    case 'L':
                        event.preventDefault();
                        this.execCommand('justifyLeft');
                        break;
                    case 'E':
                        event.preventDefault();
                        this.execCommand('justifyCenter');
                        break;
                    case 'R':
                        event.preventDefault();
                        this.execCommand('justifyRight');
                        break;
                    case 'J':
                        event.preventDefault();
                        this.execCommand('justifyFull');
                        break;
                    case '8':
                        event.preventDefault();
                        this.execCommand('insertUnorderedList');
                        break;
                    case '7':
                        event.preventDefault();
                        this.execCommand('insertOrderedList');
                        break;
                    case '>':
                        event.preventDefault();
                        this.execCommand('formatBlock', '<blockquote>');
                        break;
                    case 'I':
                        event.preventDefault();
                        this.triggerImageUpload();
                        break;
                    case 'N':
                        event.preventDefault();
                        this.clearFormatting();
                        break;
                }
            }

            // Handle image deletion with Delete key
            if (event.key === 'Delete' && this.selectedImage) {
                event.preventDefault();
                this.deleteSelectedImage();
                return;
            }

            // Handle mention dropdown navigation
            if (this.showMentionDropdown) {
                switch (event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        this.selectedMentionIndex = Math.min(
                            this.selectedMentionIndex + 1,
                            this.filteredUsers.length - 1
                        );
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        this.selectedMentionIndex = Math.max(this.selectedMentionIndex - 1, 0);
                        this.scrollToSelectedMention();
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        this.selectedMentionIndex = Math.min(
                            this.selectedMentionIndex + 1,
                            this.filteredUsers.length - 1
                        );
                        this.scrollToSelectedMention();
                        break;
                    case 'Enter':
                    case 'Tab':
                        event.preventDefault();
                        if (this.filteredUsers[this.selectedMentionIndex]) {
                            this.selectMention(this.filteredUsers[this.selectedMentionIndex]);
                        }
                        break;
                    case 'Escape':
                        this.hideMentionDropdown();
                        break;
                }
            }
        },

        onKeyup() {
            // Debounce toolbar state updates for better performance
            if (this.toolbarUpdateTimer) {
                clearTimeout(this.toolbarUpdateTimer);
            }
            this.toolbarUpdateTimer = setTimeout(() => {
                this.updateToolbarState();
            }, 50);
        },

        onPaste(event) {
            event.preventDefault();

            const clipboardData = event.clipboardData || window.clipboardData;
            const htmlData = clipboardData.getData('text/html');
            const textData = clipboardData.getData('text/plain');
            const files = clipboardData.files;

            // Handle image paste
            if (files && files.length > 0) {
                const imageFile = Array.from(files).find((file) => file.type.startsWith('image/'));
                if (imageFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.insertImage(e.target.result);
                        this.showNotification('Image pasted successfully', 'success');
                    };
                    reader.onerror = () => {
                        this.showNotification('Error pasting image', 'error');
                    };
                    reader.readAsDataURL(imageFile);
                    return;
                }
            }

            // Handle text/HTML paste
            if (htmlData) {
                this.insertFormattedHTML(htmlData);
            } else if (textData) {
                this.insertPlainText(textData);
            }
        },

        onFocus() {
            this.isFocused = true;
            this.$emit('focus');
        },

        onBlur() {
            this.isFocused = false;
            this.hideMentionDropdown();
            this.$emit('blur');
        },

        onClick(event) {
            // Update toolbar state after a brief delay to ensure selection is updated
            this.$nextTick(() => {
                this.updateToolbarState();
            });

            // Handle image clicks
            if (event.target.tagName === 'IMG' && event.target.classList.contains('editable-image')) {
                event.preventDefault();
                event.stopPropagation();
                this.selectImage(event.target);
                return;
            }

            // Close image controls if clicking outside
            if (this.showImageControls && !event.target.closest('.image-controls')) {
                this.deselectImage();
            }
        },

        execCommand(command, value = null) {
            // Prevent multiple simultaneous command executions
            if (this.isExecutingCommand) {
                return;
            }

            this.isExecutingCommand = true;

            try {
                // Ensure editor is focused before executing command
                if (!this.isFocused && this.$refs.editor) {
                    this.$refs.editor.focus();
                }

                // Small delay to ensure focus is set
                this.$nextTick(() => {
                    try {
                        const success = document.execCommand(command, false, value);

                        if (!success) {
                            console.warn(`Command "${command}" failed to execute`);
                            this.showNotification(`Unable to apply ${command} formatting`, 'error', 2000);
                            this.isExecutingCommand = false;
                            return;
                        }

                        // Update content and state
                        this.content = this.$refs.editor.innerHTML;
                        this.$emit('update:modelValue', this.content);
                        this.saveToHistory();

                        // Update toolbar state after a brief delay
                        setTimeout(() => {
                            this.updateToolbarState();
                            this.isExecutingCommand = false;
                        }, 10);
                    } catch (error) {
                        console.error('Error executing command:', error);
                        this.showNotification('An error occurred while applying formatting', 'error');
                        this.isExecutingCommand = false;
                    }
                });
            } catch (error) {
                console.error('Error in execCommand:', error);
                this.showNotification('An error occurred while applying formatting', 'error');
                this.isExecutingCommand = false;
            }
        },

        formatBlock(event) {
            const value = event.target.value;
            if (value) {
                // Use formatBlock command properly
                this.$refs.editor.focus();
                try {
                    document.execCommand('formatBlock', false, value);
                    this.content = this.$refs.editor.innerHTML;
                    this.$emit('update:modelValue', this.content);
                    this.saveToHistory();
                    this.updateToolbarState();
                } catch (error) {
                    console.error('Error formatting block:', error);
                    this.showNotification('Unable to apply formatting', 'error');
                }
            }
            // Reset select to show current format
            this.$nextTick(() => {
                event.target.value = '';
            });
        },

        isActive(command) {
            // Check cache first for performance
            if (this.toolbarStateCache.hasOwnProperty(command)) {
                return this.toolbarStateCache[command];
            }

            try {
                // Special handling for blockquote
                if (command === 'blockquote') {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const node = range.commonAncestorContainer;
                        const blockquote =
                            node.nodeType === Node.ELEMENT_NODE
                                ? node.closest('blockquote')
                                : node.parentElement?.closest('blockquote');
                        const isActive = !!blockquote;
                        this.toolbarStateCache[command] = isActive;
                        return isActive;
                    }
                    return false;
                }

                const isActive = document.queryCommandState(command);
                this.toolbarStateCache[command] = isActive;
                return isActive;
            } catch (e) {
                this.toolbarStateCache[command] = false;
                return false;
            }
        },

        insertLink() {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            // Use a more user-friendly link dialog
            const url = prompt('Enter URL:', selectedText ? '' : 'https://');
            if (url && url.trim()) {
                const linkUrl = url.trim();
                // Validate URL
                if (!linkUrl.match(/^https?:\/\//i) && !linkUrl.match(/^mailto:/i)) {
                    if (confirm('URL should start with http:// or https://. Add https:// automatically?')) {
                        this.execCommand('createLink', 'https://' + linkUrl);
                    } else {
                        this.execCommand('createLink', linkUrl);
                    }
                } else {
                    this.execCommand('createLink', linkUrl);
                }
            }
        },

        onMouseUp() {
            // Update toolbar state when selection changes via mouse
            this.$nextTick(() => {
                this.updateToolbarState();
            });
        },

        onSelectionChange(event) {
            // Update toolbar state when selection changes
            // Only update if editor is focused and selection is within editor
            if (this.isFocused && this.$refs.editor) {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    if (this.$refs.editor.contains(range.commonAncestorContainer)) {
                        // Debounce to avoid too many updates
                        if (this.toolbarUpdateTimer) {
                            clearTimeout(this.toolbarUpdateTimer);
                        }
                        this.toolbarUpdateTimer = setTimeout(() => {
                            this.updateToolbarState();
                        }, 50);
                    }
                }
            }
        },

        toggleBlockquote() {
            if (this.isActive('blockquote')) {
                // Remove blockquote
                this.execCommand('formatBlock', '<p>');
            } else {
                // Add blockquote
                this.execCommand('formatBlock', '<blockquote>');
            }
        },

        clearFormatting() {
            this.execCommand('removeFormat');
        },

        insertFormattedHTML(html) {
            const cleanedHTML = this.sanitizeHTML(html);
            this.insertHTMLAtCursor(cleanedHTML);
        },

        insertPlainText(text) {
            this.execCommand('insertText', text);
        },

        sanitizeHTML(html) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const allowedElements = [
                'b',
                'strong',
                'i',
                'em',
                'u',
                's',
                'strike',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
                'div',
                'span',
                'br',
                'ul',
                'ol',
                'li',
                'blockquote',
                'code',
                'pre',
                'a',
            ];

            return this.cleanHTML(tempDiv, allowedElements);
        },

        cleanHTML(element, allowedElements) {
            const children = Array.from(element.childNodes);

            children.forEach((child) => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    if (!allowedElements.includes(child.tagName.toLowerCase())) {
                        const span = document.createElement('span');
                        span.innerHTML = child.innerHTML;
                        child.parentNode.replaceChild(span, child);
                    } else {
                        this.cleanHTML(child, allowedElements);
                    }
                }
            });

            return element.innerHTML;
        },

        insertHTMLAtCursor(html) {
            // Store cursor position before any focus changes
            const selection = window.getSelection();
            let savedRange = null;

            if (selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }

            // Ensure the editor is focused
            this.$refs.editor.focus();

            // Restore cursor position if it was saved and is inside the editor
            if (savedRange && this.$refs.editor.contains(savedRange.commonAncestorContainer)) {
                selection.removeAllRanges();
                selection.addRange(savedRange);
            } else {
                // If no valid selection or cursor is outside editor, place it at the end
                const range = document.createRange();
                range.selectNodeContents(this.$refs.editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            // Get the current range after positioning
            const range = selection.getRangeAt(0);

            // Delete any existing content in the range
            range.deleteContents();

            // Create and insert the HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }

            range.insertNode(fragment);
            range.collapse(false);

            // Update selection
            selection.removeAllRanges();
            selection.addRange(range);

            this.content = this.$refs.editor.innerHTML;
            this.$emit('update:modelValue', this.content);
            this.saveToHistory();
        },

        handleMentions() {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;

            if (textNode.nodeType === Node.TEXT_NODE) {
                const text = textNode.textContent;
                const cursorPos = range.startOffset;

                const beforeCursor = text.substring(0, cursorPos);
                const atIndex = beforeCursor.lastIndexOf('@');

                if (atIndex !== -1) {
                    const query = beforeCursor.substring(atIndex + 1);

                    // Check if we're in a valid mention context
                    if (!query.includes(' ') && !query.includes('\n') && query.length >= 0) {
                        // Check if there's a space or start of text before @
                        const charBeforeAt = atIndex > 0 ? beforeCursor.charAt(atIndex - 1) : '';
                        const isValidMentionContext =
                            charBeforeAt === '' || charBeforeAt === ' ' || charBeforeAt === '\n';

                        if (isValidMentionContext) {
                            this.mentionQuery = query;
                            this.mentionStartPos = atIndex;
                            this.showMentionDropdown = true;
                            this.selectedMentionIndex = 0;
                            return;
                        }
                    }
                }
            }

            this.hideMentionDropdown();
        },

        selectMention(user) {
            // Ensure the editor is focused
            this.$refs.editor.focus();

            const selection = window.getSelection();
            if (selection.rangeCount === 0) {
                // Create a new range at the end of the editor
                const range = document.createRange();
                range.selectNodeContents(this.$refs.editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;

            if (textNode.nodeType === Node.TEXT_NODE) {
                const text = textNode.textContent;
                const beforeAt = text.substring(0, this.mentionStartPos);
                const afterQuery = text.substring(range.startOffset);

                // Create mention span with better styling and data attributes
                const mentionSpan = document.createElement('span');
                mentionSpan.className = 'mention';
                mentionSpan.setAttribute('data-user-id', user.id);
                mentionSpan.setAttribute('data-user-name', user.name);
                mentionSpan.setAttribute('data-user-email', user.email);
                mentionSpan.setAttribute('contenteditable', 'false');
                mentionSpan.style.cssText = `
                    background-color: #e0f2fe;
                    color: #0369a1;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 500;
                    cursor: default;
                    display: inline-block;
                    margin: 0 1px;
                `;
                mentionSpan.textContent = `@${user.name}`;

                const beforeNode = document.createTextNode(beforeAt);
                const afterNode = document.createTextNode(afterQuery);

                const parent = textNode.parentNode;
                parent.insertBefore(beforeNode, textNode);
                parent.insertBefore(mentionSpan, textNode);
                parent.insertBefore(afterNode, textNode);
                parent.removeChild(textNode);

                // Position cursor after the mention
                const newRange = document.createRange();
                newRange.setStartAfter(mentionSpan);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);

                this.content = this.$refs.editor.innerHTML;
                this.$emit('update:modelValue', this.content);
                this.$emit('mention', user);
            } else {
                // Alternative approach for non-text nodes
                const mentionSpan = document.createElement('span');
                mentionSpan.className = 'mention';
                mentionSpan.setAttribute('data-user-id', user.id);
                mentionSpan.setAttribute('data-user-name', user.name);
                mentionSpan.setAttribute('data-user-email', user.email);
                mentionSpan.setAttribute('contenteditable', 'false');
                mentionSpan.style.cssText = `
                    background-color: #e0f2fe;
                    color: #0369a1;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 500;
                    cursor: default;
                    display: inline-block;
                    margin: 0 1px;
                `;
                mentionSpan.textContent = `@${user.name}`;

                // Insert at current cursor position
                range.deleteContents();
                range.insertNode(mentionSpan);

                // Position cursor after the mention
                const newRange = document.createRange();
                newRange.setStartAfter(mentionSpan);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);

                this.content = this.$refs.editor.innerHTML;
                this.$emit('update:modelValue', this.content);
                this.$emit('mention', user);
            }

            this.hideMentionDropdown();
        },

        hideMentionDropdown() {
            this.showMentionDropdown = false;
            this.mentionQuery = '';
            this.selectedMentionIndex = 0;
        },

        scrollToSelectedMention() {
            this.$nextTick(() => {
                const activeItem = this.$el.querySelector('.mention-item.active');
                if (activeItem) {
                    activeItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                    });
                }
            });
        },

        saveToHistory() {
            if (this.history.length > 50) {
                this.history.shift();
            }

            const currentContent = this.$refs.editor ? this.$refs.editor.innerHTML : this.content;

            if (this.history.length === 0 || this.history[this.history.length - 1] !== currentContent) {
                this.history.push(currentContent);
                this.historyIndex = this.history.length - 1;
            }
        },

        undo() {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                const content = this.history[this.historyIndex];
                this.content = content;
                this.$refs.editor.innerHTML = content;
                this.$emit('update:modelValue', content);
            }
        },

        redo() {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                const content = this.history[this.historyIndex];
                this.content = content;
                this.$refs.editor.innerHTML = content;
                this.$emit('update:modelValue', content);
            }
        },

        placeCursorAtEnd() {
            const editor = this.$refs.editor;
            if (!editor) return;

            const range = document.createRange();
            const selection = window.getSelection();

            // Move cursor to the end of the content
            range.selectNodeContents(editor);
            range.collapse(false);

            selection.removeAllRanges();
            selection.addRange(range);
        },

        updateToolbarState() {
            // Clear cache to force fresh state check
            this.toolbarStateCache = {};

            // Use requestAnimationFrame for smooth updates
            if (this.$refs.editor && document.hasFocus()) {
                requestAnimationFrame(() => {
                    // Force Vue to update toolbar button states
                    this.$forceUpdate();
                });
            }
        },

        // New enhanced methods
        triggerImageUpload() {
            this.$refs.imageInput.click();
        },

        handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) {
                event.target.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showNotification('Please select a valid image file', 'error');
                event.target.value = '';
                return;
            }

            // Check file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                this.showNotification(
                    `Image size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
                    'error'
                );
                event.target.value = '';
                return;
            }

            // Show loading state
            this.isImageUploading = true;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    if (this.imageToReplace) {
                        // Replace existing image
                        this.imageToReplace.src = e.target.result;
                        this.imageToReplace = null;
                        this.updateContent();
                        this.showNotification('Image replaced successfully', 'success');
                    } else {
                        // Insert new image
                        this.insertImage(e.target.result);
                        this.showNotification('Image inserted successfully', 'success');
                    }
                } catch (error) {
                    console.error('Error handling image:', error);
                    this.showNotification('Error processing image', 'error');
                } finally {
                    this.isImageUploading = false;
                }
            };
            reader.onerror = () => {
                this.showNotification('Error reading image file', 'error');
                this.isImageUploading = false;
            };
            reader.readAsDataURL(file);

            // Reset input
            event.target.value = '';
        },

        insertImage(src) {
            const img = document.createElement('img');
            img.src = src;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.cursor = 'pointer';
            img.style.display = 'block';
            img.style.margin = '1rem auto';
            img.classList.add('editable-image');
            img.setAttribute('alt', 'Inserted image');
            img.setAttribute('loading', 'lazy');

            // Add error handling
            img.onerror = () => {
                this.showNotification('Failed to load image', 'error');
            };

            this.insertHTMLAtCursor(img.outerHTML);
        },

        // Image management methods

        selectImage(img) {
            // Remove previous selection
            this.deselectImage();

            // Select new image
            this.selectedImage = img;
            img.classList.add('selected-image');

            // Position controls near image
            const rect = img.getBoundingClientRect();
            const editorRect = this.$refs.editor.getBoundingClientRect();

            this.imageControlsPosition = {
                x: rect.left - editorRect.left + rect.width / 2 - 100, // Center controls
                y: rect.top - editorRect.top - 60, // Above image
            };

            this.showImageControls = true;
        },

        deselectImage() {
            if (this.selectedImage) {
                this.selectedImage.classList.remove('selected-image');
                this.selectedImage = null;
            }
            this.showImageControls = false;
        },

        closeImageControls() {
            this.deselectImage();
        },

        alignImage(alignment) {
            if (!this.selectedImage) return;

            this.selectedImage.style.float = alignment === 'center' ? 'none' : alignment;
            this.selectedImage.style.display = alignment === 'center' ? 'block' : 'inline-block';
            this.selectedImage.style.margin = alignment === 'center' ? '0 auto' : '0';

            this.updateContent();
        },

        resizeImage(size) {
            if (!this.selectedImage) return;

            const sizes = {
                small: '25%',
                medium: '50%',
                large: '75%',
            };

            this.selectedImage.style.maxWidth = sizes[size] || '100%';
            this.updateContent();
        },

        replaceImage() {
            if (!this.selectedImage) return;

            // Trigger file input for replacement
            this.$refs.imageInput.click();

            // Store reference to image being replaced
            this.imageToReplace = this.selectedImage;
        },

        deleteSelectedImage() {
            if (!this.selectedImage) return;

            this.selectedImage.remove();
            this.deselectImage();
            this.updateContent();
        },

        updateContent() {
            this.content = this.$refs.editor.innerHTML;
            this.$emit('update:modelValue', this.content);
            this.saveToHistory();
        },

        deleteTable(buttonElement) {
            // Find the table wrapper
            const tableWrapper = buttonElement.closest('.table-wrapper');
            if (tableWrapper) {
                // Remove the table from DOM
                tableWrapper.remove();

                // Update the content and trigger Vue reactivity
                this.content = this.$refs.editor.innerHTML;
                this.$emit('update:modelValue', this.content);
                this.saveToHistory();
            }
        },

        insertTable() {
            // Prompt for table dimensions
            const rows = prompt('Number of rows (2-10):', '3');
            const cols = prompt('Number of columns (2-10):', '3');

            const numRows = Math.min(Math.max(parseInt(rows) || 3, 2), 10);
            const numCols = Math.min(Math.max(parseInt(cols) || 3, 2), 10);

            let tableHTML = '<div class="table-wrapper" contenteditable="false"><table class="custom-table">';

            // Create header row
            tableHTML += '<thead><tr>';
            for (let i = 0; i < numCols; i++) {
                tableHTML += `<th>Header ${i + 1}</th>`;
            }
            tableHTML += '</tr></thead>';

            // Create body rows
            tableHTML += '<tbody>';
            for (let r = 0; r < numRows; r++) {
                tableHTML += '<tr>';
                for (let c = 0; c < numCols; c++) {
                    tableHTML += `<td>Cell ${r + 1}-${c + 1}</td>`;
                }
                tableHTML += '</tr>';
            }
            tableHTML += '</tbody></table>';

            // Add delete button
            tableHTML += '<div class="table-controls">';
            tableHTML +=
                '<button type="button" onclick="window.customEditorInstance.deleteTable(this)" class="table-delete-btn">';
            tableHTML += '🗑️ Delete Table';
            tableHTML += '</button>';
            tableHTML += '</div></div>';

            this.insertHTMLAtCursor(tableHTML);
            this.showNotification('Table inserted successfully', 'success');
        },

        insertHorizontalRule() {
            this.insertHTMLAtCursor('<hr style="margin: 20px 0; border: none; border-top: 2px solid #e5e7eb;">');
            this.showNotification('Horizontal rule inserted', 'success', 2000);
        },

        toggleEmojiPicker() {
            if (!this.showEmojiPicker) {
                // Save cursor position before opening picker
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    this.savedCursorPosition = selection.getRangeAt(0).cloneRange();
                } else {
                    this.savedCursorPosition = null;
                }

                // When opening emoji picker, ensure editor is focused and cursor is positioned
                this.$refs.editor.focus();

                // Calculate position of emoji button
                this.$nextTick(() => {
                    if (this.$refs.emojiButton) {
                        const buttonRect = this.$refs.emojiButton.getBoundingClientRect();
                        const editorRect = this.$refs.editor.getBoundingClientRect();
                        const viewportWidth = window.innerWidth;

                        let left = buttonRect.left - editorRect.left;
                        let top = buttonRect.bottom - editorRect.top + 5; // 5px gap

                        // Adjust if emoji picker would go off-screen
                        const pickerWidth = 320;
                        if (left + pickerWidth > viewportWidth) {
                            left = viewportWidth - pickerWidth - 10; // 10px margin from edge
                        }

                        this.emojiPickerPosition = {
                            top: top,
                            left: left,
                        };
                    }
                });
            }
            this.showEmojiPicker = !this.showEmojiPicker;
        },

        insertEmoji(emoji) {
            // Ensure editor is focused
            this.$refs.editor.focus();

            // Use nextTick to ensure DOM is updated before restoring position
            this.$nextTick(() => {
                const selection = window.getSelection();

                // Restore cursor position if it was saved and is inside the editor
                if (
                    this.savedCursorPosition &&
                    this.$refs.editor.contains(this.savedCursorPosition.commonAncestorContainer)
                ) {
                    selection.removeAllRanges();
                    selection.addRange(this.savedCursorPosition);
                } else {
                    // If no valid selection or cursor is outside editor, place it at the end
                    const range = document.createRange();
                    range.selectNodeContents(this.$refs.editor);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                // Insert emoji at cursor position
                this.insertHTMLAtCursor(emoji);
                this.showEmojiPicker = false;
                this.savedCursorPosition = null; // Clear saved position

                // Trigger input event to ensure content is updated
                this.$refs.editor.dispatchEvent(new Event('input', { bubbles: true }));
            });
        },

        toggleFullscreen() {
            this.isFullscreen = !this.isFullscreen;
            if (this.isFullscreen) {
                document.body.style.overflow = 'hidden';
                // Ensure toolbar is visible in fullscreen
                this.$nextTick(() => {
                    // Force toolbar to be visible
                    const toolbar = this.$el?.querySelector('.custom-editor__toolbar');
                    if (toolbar) {
                        toolbar.style.display = 'flex';
                        toolbar.style.visibility = 'visible';
                        toolbar.style.opacity = '1';
                    }
                    // Ensure editor is focused
                    if (this.$refs.editor) {
                        this.$refs.editor.focus();
                    }
                });
            } else {
                document.body.style.overflow = '';
            }
        },

        startAutoSave() {
            if (this.enableAutoSave && this.autoSaveTimer === null) {
                this.autoSaveTimer = setInterval(() => {
                    this.performAutoSave();
                }, this.autoSaveInterval);
            }
        },

        stopAutoSave() {
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
                this.autoSaveTimer = null;
            }
        },

        performAutoSave() {
            if (this.content && this.content.trim() && !this.isTyping) {
                this.isAutoSaving = true;
                // Simulate auto-save (in real app, this would be an API call)
                setTimeout(() => {
                    this.isAutoSaving = false;
                    this.lastSaved = this.formatTime(new Date());
                }, 1000);
            }
        },

        formatTime(date) {
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);

            if (minutes < 1) return 'just now';
            if (minutes < 60) return `${minutes}m ago`;

            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;

            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        },

        handleFullscreenChange() {
            this.isFullscreen = !!document.fullscreenElement;
        },

        handleGlobalKeydown(event) {
            // Global keyboard shortcuts can be added here if needed
        },

        // Export functionality
        exportContent(format) {
            this.showExportMenu = false;

            switch (format) {
                case 'html':
                    this.exportAsHTML();
                    break;
                case 'markdown':
                    this.exportAsMarkdown();
                    break;
                case 'text':
                    this.exportAsText();
                    break;
                case 'pdf':
                    this.exportAsPDF();
                    break;
            }
        },

        exportAsHTML() {
            const htmlContent = this.content;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            this.downloadFile(blob, 'content.html');
        },

        exportAsMarkdown() {
            const markdown = this.htmlToMarkdown(this.content);
            const blob = new Blob([markdown], { type: 'text/markdown' });
            this.downloadFile(blob, 'content.md');
        },

        exportAsText() {
            const textContent = this.content.replace(/<[^>]*>/g, '');
            const blob = new Blob([textContent], { type: 'text/plain' });
            this.downloadFile(blob, 'content.txt');
        },

        exportAsPDF() {
            // Simple PDF export using browser's print functionality
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Exported Content</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                        h1, h2, h3, h4, h5, h6 { color: #333; }
                        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
                        blockquote { border-left: 4px solid #ddd; margin: 20px 0; padding: 10px 20px; background: #f9f9f9; }
                    </style>
                </head>
                <body>
                    ${this.content}
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        },

        downloadFile(blob, filename) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        showNotification(message, type = 'info', duration = 3000) {
            this.notification = { message, type, show: true };

            if (this.notificationTimer) {
                clearTimeout(this.notificationTimer);
            }

            this.notificationTimer = setTimeout(() => {
                this.notification.show = false;
            }, duration);
        },

        htmlToMarkdown(html) {
            // Simple HTML to Markdown conversion
            let markdown = html;

            // Convert headings
            markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
            markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
            markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
            markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
            markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
            markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

            // Convert bold and italic
            markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
            markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
            markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
            markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

            // Convert links
            markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

            // Convert lists
            markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
                return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
            });
            markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
                let counter = 1;
                return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
            });

            // Convert blockquotes
            markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n');

            // Convert code blocks
            markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
            markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

            // Convert paragraphs
            markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

            // Convert line breaks
            markdown = markdown.replace(/<br[^>]*>/gi, '\n');

            // Remove remaining HTML tags
            markdown = markdown.replace(/<[^>]*>/g, '');

            // Clean up extra whitespace
            markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
            markdown = markdown.trim();

            return markdown;
        },
    },
};
</script>

<style scoped>
.custom-editor {
    position: relative;
    border: 1px solid var(--line);
    border-radius: 0.5rem;
    background: var(--surface);
    transition:
        border-color 0.2s,
        box-shadow 0.2s;
}

.custom-editor--focused {
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 3px rgba(var(--accent-fill-rgb), 0.15);
}

.custom-editor__toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--line);
    background: var(--surface-sunken);
    border-radius: 0.5rem 0.5rem 0 0;
    flex-wrap: wrap;
}

.toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.toolbar-separator {
    width: 1px;
    height: 1.5rem;
    background: var(--line-strong);
    margin: 0 0.25rem;
}

.toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    background: transparent;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
}

.toolbar-btn:active {
    transform: scale(0.95);
}

.toolbar-btn:hover {
    background: var(--line);
    color: var(--ink);
}

.toolbar-btn.active {
    background: var(--accent-fill);
    color: var(--accent-on);
    border-color: var(--accent-ink);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.toolbar-btn.active:hover {
    background: var(--accent-fill-hover);
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
}

.toolbar-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--line-strong);
    border-radius: 0.375rem;
    background: var(--surface);
    color: var(--ink);
    font-size: 0.875rem;
    cursor: pointer;
}

.toolbar-select:focus {
    outline: none;
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 2px rgba(var(--accent-fill-rgb), 0.15);
}

.custom-editor__content {
    min-height: 120px;
    padding: 1rem;
    outline: none;
    line-height: 1.6;
    color: var(--ink);
    position: relative;
}

.custom-editor__content h1 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 1rem 0 0.5rem 0;
}

.custom-editor__content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
}

.custom-editor__content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
}

.custom-editor__content p {
    margin: 0.5rem 0;
}

.custom-editor__content ul,
.custom-editor__content ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.custom-editor__content li {
    margin: 0.25rem 0;
}

.custom-editor__content blockquote {
    border-left: 4px solid var(--line-strong);
    padding-left: 1rem;
    margin: 1rem 0;
    color: var(--ink-muted);
    font-style: italic;
}

.custom-editor__content code {
    background: var(--surface-raised);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.875em;
}

.custom-editor__content pre {
    background: var(--surface-raised);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
}

.custom-editor__content a {
    color: var(--accent-ink);
    text-decoration: underline;
}

.custom-editor__content .mention {
    background: var(--tint-info-bg);
    color: var(--tint-info-ink);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.custom-editor__content .mention:hover {
    background: var(--tint-info-bg);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-editor__preview .mention {
    background: var(--tint-info-bg);
    color: var(--tint-info-ink);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.custom-editor__preview .mention:hover {
    background: var(--tint-info-bg);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-editor__mentions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 0.5rem;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 1000;
    max-height: 280px;
    overflow: hidden;
    margin-top: 0.25rem;
}

.mentions-list {
    max-height: 280px;
    overflow-y: auto;
}

.mentions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem 0.5rem;
    border-bottom: 1px solid var(--line);
    background: #fafafa;
}

.mentions-title {
    font-weight: 600;
    color: var(--ink);
    font-size: 0.875rem;
}

.mentions-count {
    color: var(--ink-muted);
    font-size: 0.75rem;
    background: var(--line);
    padding: 0.125rem 0.5rem;
    border-radius: 0.75rem;
}

.mention-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid #f9fafb;
    position: relative;
}

.mention-item:last-child {
    border-bottom: none;
}

.mention-item:hover,
.mention-item.active {
    background: linear-gradient(90deg, var(--tint-info-bg) 0%, var(--tint-info-bg) 100%);
    border-left: 3px solid var(--tint-info-ink);
}

.mention-avatar-container {
    position: relative;
    margin-right: 0.75rem;
}

.mention-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--line);
}

.mention-avatar-placeholder {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-on);
    font-weight: 600;
    font-size: 0.875rem;
    border: 2px solid var(--line);
}

.mention-info {
    flex: 1;
    min-width: 0;
}

.mention-name {
    font-weight: 600;
    color: var(--ink);
    font-size: 0.875rem;
    margin-bottom: 0.125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mention-email {
    color: var(--ink-muted);
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mention-selected {
    color: var(--tint-info-ink);
    margin-left: 0.5rem;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.mentions-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    color: var(--ink-muted);
    font-size: 0.875rem;
}

.mentions-empty svg {
    margin-bottom: 0.5rem;
    opacity: 0.5;
}

/* Mention spans in editor content */
.custom-editor__content .mention {
    background-color: var(--tint-info-bg);
    color: #0369a1;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    cursor: default;
    display: inline-block;
    margin: 0 1px;
    text-decoration: none;
    border: 1px solid #bae6fd;
}

.custom-editor__content .mention:hover {
    background-color: #bae6fd;
    color: var(--tint-info-ink);
}

/* Content Wrapper */
.custom-editor__content-wrapper {
    position: relative;
}

/* Preview Mode */
.custom-editor__preview {
    min-height: 120px;
    padding: 1rem;
    border: 1px solid var(--line);
    border-radius: 0.375rem;
    background: var(--surface-sunken);
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--ink);
    overflow-y: auto;
    max-height: 400px;
}

.custom-editor__preview h1,
.custom-editor__preview h2,
.custom-editor__preview h3,
.custom-editor__preview h4,
.custom-editor__preview h5,
.custom-editor__preview h6 {
    margin: 0.5rem 0;
    font-weight: 600;
    color: var(--ink);
}

.custom-editor__preview h1 {
    font-size: 1.5rem;
}
.custom-editor__preview h2 {
    font-size: 1.25rem;
}
.custom-editor__preview h3 {
    font-size: 1.125rem;
}
.custom-editor__preview h4 {
    font-size: 1rem;
}
.custom-editor__preview h5 {
    font-size: 0.875rem;
}
.custom-editor__preview h6 {
    font-size: 0.75rem;
}

.custom-editor__preview p {
    margin: 0.5rem 0;
}

.custom-editor__preview ul,
.custom-editor__preview ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.custom-editor__preview li {
    margin: 0.25rem 0;
}

.custom-editor__preview blockquote {
    margin: 0.5rem 0;
    padding: 0.5rem 1rem;
    border-left: 4px solid var(--line);
    background: var(--surface-raised);
    font-style: italic;
    color: var(--ink-muted);
}

.custom-editor__preview code {
    padding: 0.125rem 0.25rem;
    background: var(--surface-raised);
    border-radius: 0.25rem;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.875em;
}

.custom-editor__preview pre {
    margin: 0.5rem 0;
    padding: 1rem;
    background: var(--surface-raised);
    border-radius: 0.375rem;
    overflow-x: auto;
}

.custom-editor__preview pre code {
    background: none;
    padding: 0;
}

.custom-editor__preview strong,
.custom-editor__preview b {
    font-weight: 600;
}

.custom-editor__preview em,
.custom-editor__preview i {
    font-style: italic;
}

.custom-editor__preview u {
    text-decoration: underline;
}

.custom-editor__preview s,
.custom-editor__preview strike {
    text-decoration: line-through;
}

.custom-editor__preview a {
    color: var(--accent-ink);
    text-decoration: underline;
}

.custom-editor__preview a:hover {
    color: var(--tint-info-ink);
}

.custom-editor__preview .mention {
    background-color: var(--tint-info-bg);
    color: #0369a1;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    text-decoration: none;
    border: 1px solid #bae6fd;
}

.custom-editor__preview .mention:hover {
    background-color: #bae6fd;
    color: var(--tint-info-ink);
}

/* Mobile responsive */
@media (max-width: 768px) {
    .custom-editor__toolbar {
        padding: 0.5rem;
        gap: 0.25rem;
    }

    .toolbar-btn {
        width: 1.75rem;
        height: 1.75rem;
    }

    .toolbar-separator {
        display: none;
    }

    .custom-editor__content {
        padding: 0.75rem;
        min-height: 100px;
    }
}

/* Status Bar Styles */
.custom-editor__status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: var(--surface-sunken);
    border-top: 1px solid var(--line);
    font-size: 0.75rem;
    color: var(--ink-muted);
}

.status-left {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.status-right {
    display: flex;
    align-items: center;
}

.word-count,
.char-count,
.reading-time {
    font-weight: 500;
}

.auto-save-status {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--tint-info-ink);
}

.last-saved {
    color: var(--tint-good-ink);
}

/* Emoji Picker Styles */
.emoji-picker {
    position: absolute;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 8px;
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-height: 300px;
    width: 320px;
    overflow: hidden;
    z-index: 1000;
}

/* Export Menu Styles */
.export-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 8px;
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 1000;
    min-width: 200px;
    overflow: hidden;
}

.export-menu__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--line);
    background-color: var(--surface-sunken);
}

.export-menu__close {
    background: none;
    border: none;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.export-menu__close:hover {
    background-color: var(--surface-raised);
}

.export-menu__content {
    padding: 0.5rem;
}

.export-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
    font-size: 0.875rem;
    color: var(--ink);
}

.export-btn:hover {
    background-color: var(--surface-raised);
}

/* Keyboard Shortcuts Overlay */
.keyboard-shortcuts-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
}

.keyboard-shortcuts-modal {
    background: var(--surface);
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
}

.keyboard-shortcuts__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--line);
    background: var(--surface-sunken);
}

.keyboard-shortcuts__header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--ink);
}

.keyboard-shortcuts__close {
    background: none;
    border: none;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.keyboard-shortcuts__close:hover {
    background-color: var(--surface-raised);
}

.keyboard-shortcuts__content {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.shortcut-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    border-bottom: 1px solid var(--line);
    padding-bottom: 0.5rem;
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--line);
}

.shortcut-item:last-child {
    border-bottom: none;
}

.shortcut-item span {
    color: var(--ink-muted);
    font-size: 0.875rem;
}

kbd {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: var(--surface-raised);
    border: 1px solid var(--line-strong);
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.75rem;
    color: var(--ink);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.emoji-picker__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--line);
    background-color: var(--surface-sunken);
}

.emoji-picker__close {
    background: none;
    border: none;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.emoji-picker__close:hover {
    background-color: var(--surface-raised);
}

.emoji-picker__content {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.25rem;
    padding: 1rem;
    max-height: 200px;
    overflow-y: auto;
}

.emoji-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    font-size: 1.25rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.emoji-item:hover {
    background-color: var(--surface-raised);
}

/* Fullscreen Styles */
.custom-editor--fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 99999 !important;
    background: var(--surface) !important;
    height: 100vh !important;
    width: 100vw !important;
    margin: 0 !important;
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
}

.custom-editor--fullscreen .custom-editor__toolbar {
    display: flex !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 100000 !important;
    background: var(--surface-sunken) !important;
    border-bottom: 2px solid var(--line) !important;
    padding: 1rem !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
}

.custom-editor--fullscreen .custom-editor__content-wrapper {
    position: relative;
    height: calc(100vh - 140px);
    overflow-y: auto;
    overflow-x: hidden;
}

.custom-editor--fullscreen .custom-editor__content {
    min-height: calc(100vh - 180px);
    max-height: none;
    padding: 1.5rem;
}

.custom-editor--fullscreen .custom-editor__status {
    position: sticky;
    bottom: 0;
    z-index: 100000;
    background: var(--surface-sunken);
    border-top: 2px solid var(--line);
}

/* Ensure all dropdowns work in fullscreen */
.custom-editor--fullscreen .custom-editor__mentions {
    z-index: 100001 !important;
}

.custom-editor--fullscreen .emoji-picker {
    z-index: 100001 !important;
}

.custom-editor--fullscreen .export-menu {
    z-index: 100001 !important;
}

.custom-editor--fullscreen .image-controls {
    z-index: 100001 !important;
}

.custom-editor--fullscreen .keyboard-shortcuts-overlay {
    z-index: 100002 !important;
}

.custom-editor--fullscreen .notification {
    z-index: 100003 !important;
}

/* Enhanced Toolbar Styles */
.toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.toolbar-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--line-strong);
    border-radius: 4px;
    background: var(--surface);
    font-size: 0.875rem;
    color: var(--ink);
    cursor: pointer;
    transition: border-color 0.2s;
}

.toolbar-select:hover {
    border-color: var(--line-strong);
}

.toolbar-select:focus {
    outline: none;
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 3px rgba(var(--accent-fill-rgb), 0.15);
}

/* Enhanced Table Styles */
.custom-editor .table-wrapper {
    margin: 1rem 0;
    border: 1px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-editor .custom-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0;
}

.custom-editor .custom-table th,
.custom-editor .custom-table td {
    border: 1px solid var(--line);
    padding: 12px;
    text-align: left;
    vertical-align: top;
}

.custom-editor .custom-table th {
    background-color: var(--surface-sunken);
    font-weight: 600;
    color: var(--ink);
}

.custom-editor .custom-table tr:nth-child(even) {
    background-color: var(--surface-sunken);
}

.custom-editor .custom-table tr:hover {
    background-color: var(--surface-raised);
}

.custom-editor .table-controls {
    background-color: var(--surface-sunken);
    padding: 8px 12px;
    border-top: 1px solid var(--line);
    text-align: center;
}

/* Mobile Responsive Enhancements */
@media (max-width: 768px) {
    .custom-editor__status {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }

    .status-left {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .emoji-picker__content {
        grid-template-columns: repeat(6, 1fr);
        padding: 0.75rem;
    }

    .emoji-item {
        width: 1.75rem;
        height: 1.75rem;
        font-size: 1rem;
    }

    .custom-editor--fullscreen .custom-editor__content {
        height: calc(100vh - 140px);
    }
}

/* Animation Enhancements */
.custom-editor__status {
    transition: all 0.3s ease;
}

.emoji-picker {
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.toolbar-btn {
    transition: all 0.2s ease;
}

.toolbar-btn:hover {
    transform: translateY(-1px);
}

.toolbar-btn:active {
    transform: translateY(0);
}

/* Accessibility Enhancements */
.custom-editor:focus-within {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

.toolbar-btn:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

.emoji-item:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
    .custom-editor__status {
        background-color: var(--surface);
        border-top-color: #000000;
    }

    .emoji-picker {
        border-color: #000000;
    }

    .toolbar-btn {
        border: 1px solid #000000;
    }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
    .custom-editor__status,
    .toolbar-btn,
    .emoji-picker {
        transition: none;
    }

    .emoji-picker {
        animation: none;
    }
}

/* Image Management Styles */
.editable-image {
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    border-radius: 4px;
}

.editable-image:hover {
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 2px rgba(var(--accent-fill-rgb), 0.15);
}

.selected-image {
    border-color: var(--accent-ink) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
    outline: none;
}

/* Image Controls */
.image-controls {
    position: absolute;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 8px;
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 1000;
    min-width: 200px;
    animation: slideDown 0.2s ease;
}

.image-controls__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--line);
    background: var(--surface-sunken);
    border-radius: 8px 8px 0 0;
}

.image-controls__header span {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--ink);
}

.image-controls__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: var(--ink-muted);
}

.image-controls__close:hover {
    background: var(--line);
    color: var(--ink);
}

.image-controls__content {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.75rem;
}

.image-control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--ink);
}

.image-control-btn:hover {
    background: var(--surface-raised);
    border-color: var(--line-strong);
    color: var(--ink);
}

.image-control-btn--danger {
    color: var(--tint-bad-ink);
    border-color: var(--tint-bad-border);
}

.image-control-btn--danger:hover {
    background: var(--tint-bad-bg);
    border-color: var(--tint-bad-border);
    color: var(--tint-bad-ink);
}

.image-control-separator {
    width: 1px;
    height: 2rem;
    background: var(--line);
    margin: 0 0.25rem;
}

/* Image alignment styles */
.custom-editor__content img[style*='float: left'] {
    float: left;
    margin-right: 1rem;
    margin-bottom: 0.5rem;
}

.custom-editor__content img[style*='float: right'] {
    float: right;
    margin-left: 1rem;
    margin-bottom: 0.5rem;
}

.custom-editor__content img[style*='margin: 0 auto'] {
    display: block;
    margin: 0.5rem auto;
}

/* Image size styles */
.custom-editor__content img[style*='max-width: 25%'] {
    max-width: 25% !important;
}

.custom-editor__content img[style*='max-width: 50%'] {
    max-width: 50% !important;
}

.custom-editor__content img[style*='max-width: 75%'] {
    max-width: 75% !important;
}

/* Mobile responsive for image controls */
@media (max-width: 640px) {
    .image-controls {
        left: 0.5rem !important;
        right: 0.5rem !important;
        width: auto !important;
        min-width: auto;
    }

    .image-controls__content {
        justify-content: center;
    }

    .image-control-btn {
        width: 2.5rem;
        height: 2.5rem;
    }
}

/* Notification Toast */
.notification {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    background: var(--surface);
    border-radius: 0.5rem;
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 10001;
    min-width: 250px;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
    border-left: 4px solid;
}

.notification--success {
    border-left-color: var(--tint-good-ink);
    color: #065f46;
}

.notification--success svg {
    color: var(--tint-good-ink);
}

.notification--error {
    border-left-color: var(--tint-bad-ink);
    color: var(--tint-bad-ink);
}

.notification--error svg {
    color: var(--tint-bad-ink);
}

.notification--info {
    border-left-color: #3b82f6;
    color: var(--tint-info-ink);
}

.notification--info svg {
    color: var(--accent-ink);
}

.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Enhanced Status Bar */
.status-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 0.375rem;
    font-size: 0.75rem;
    transition: all 0.2s ease;
}

.status-item:hover {
    background: rgba(255, 255, 255, 0.9);
}

.status-item svg {
    opacity: 0.7;
}

.status-ready {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--ink-muted);
    font-size: 0.75rem;
}

.status-ready svg {
    opacity: 0.6;
}

.auto-save-status,
.last-saved {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
}

.last-saved svg {
    color: var(--tint-good-ink);
}

/* Enhanced Table Delete Button */
.table-delete-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #dc3545;
    color: var(--accent-on);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.table-delete-btn:hover {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.table-delete-btn:active {
    transform: translateY(0);
}

/* Enhanced Toolbar Button States */
.toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.toolbar-btn.loading {
    position: relative;
    pointer-events: none;
}

.toolbar-btn.loading::after {
    content: '';
    position: absolute;
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

/* Improved Editor Focus States */
.custom-editor__content:focus {
    outline: none;
}

/* Enhanced Image Loading State */
.editable-image.loading {
    opacity: 0.6;
    position: relative;
}

.editable-image.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2rem;
    height: 2rem;
    margin: -1rem 0 0 -1rem;
    border: 3px solid var(--line);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    .notification {
        background: #1f2937;
        color: #f3f4f6;
    }

    .notification--success {
        border-left-color: var(--tint-good-ink);
        color: #6ee7b7;
    }

    .notification--error {
        border-left-color: var(--tint-bad-ink);
        color: var(--tint-bad-ink);
    }

    .notification--info {
        border-left-color: #3b82f6;
        color: #93c5fd;
    }

    .status-item {
        background: rgba(31, 41, 55, 0.6);
        color: var(--ink-subtle);
    }

    .status-item:hover {
        background: rgba(31, 41, 55, 0.9);
    }
}
</style>
