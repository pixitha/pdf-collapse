import { App, Plugin, PluginSettingTab, Setting, MarkdownView } from 'obsidian';

// Plugin settings interface
interface MyPluginSettings {
    hidePDFPreviews: boolean;
}

// Default settings
const DEFAULT_SETTINGS: MyPluginSettings = {
    hidePDFPreviews: false,
};

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;
    private observer: MutationObserver | null = null;

    async onload() {
        console.log('Loading plugin');

        // Load settings
        await this.loadSettings();

        // Add a command to toggle PDF preview hiding
        this.addCommand({
            id: 'toggle-hide-pdf-previews',
            name: 'Toggle Hide PDF Previews',
            callback: () => this.toggleHidePDFPreviews()
        });

        // Add a button to the ribbon
        this.addRibbonIcon('eye-off', 'Toggle Hide PDF Previews', () => this.toggleHidePDFPreviews());

        // Initialize the Mutation Observer
        this.initMutationObserver();

        // Initially hide or show PDFs based on the current setting
        if (this.settings.hidePDFPreviews) {
            this.hideAllPDFPreviews();
        }
    }

    initMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            if (this.settings.hidePDFPreviews) {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        console.log('New nodes detected, checking for PDF previews...');
                        this.hideNewPDFPreviews(mutation.addedNodes);
                    }
                });
            }
        });

        // Observe the entire document for added nodes
        this.observer.observe(document.body, { childList: true, subtree: true });
        console.log('Mutation observer initialized.');
    }

    async toggleHidePDFPreviews() {
        this.settings.hidePDFPreviews = !this.settings.hidePDFPreviews;
        await this.saveSettings();

        if (this.settings.hidePDFPreviews) {
            console.log('Hiding all PDF previews...');
            this.hideAllPDFPreviews();
        } else {
            console.log('Showing all PDF previews...');
            this.showAllPDFPreviews();
        }
    }

    async hideAllPDFPreviews() {
        console.log('Attempting to hide all PDF previews...');
        // Get all Markdown views
        const markdownViews = this.app.workspace.getLeavesOfType('markdown').map(leaf => leaf.view);
        markdownViews.forEach((view) => {
            if (view instanceof MarkdownView) {
                const contentEl = view.contentEl;

                // Hide all currently rendered PDF previews in editor view
                const pdfPreviewsEditorView = contentEl.querySelectorAll('div.textLayer');
                pdfPreviewsEditorView.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Hiding PDF preview in editor view:', preview);
                        preview.style.display = 'none';
                    }
                });

                // Hide all currently rendered PDF previews in reading view
                const pdfPreviewsReadingView = contentEl.querySelectorAll('span.pdf-embed');
                pdfPreviewsReadingView.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Hiding PDF preview in reading view:', preview);
                        preview.style.display = 'none';
                    }
                });
            }
        });
    }

    async showAllPDFPreviews() {
        console.log('Attempting to show all PDF previews...');
        // Get all Markdown views
        const markdownViews = this.app.workspace.getLeavesOfType('markdown').map(leaf => leaf.view);
        markdownViews.forEach((view) => {
            if (view instanceof MarkdownView) {
                const contentEl = view.contentEl;

                // Show all currently hidden PDF previews in editor view
                const pdfPreviewsEditorView = contentEl.querySelectorAll('div.textLayer');
                pdfPreviewsEditorView.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Showing PDF preview in editor view:', preview);
                        preview.style.display = '';
                    }
                });

                // Show all currently hidden PDF previews in reading view
                const pdfPreviewsReadingView = contentEl.querySelectorAll('span.pdf-embed');
                pdfPreviewsReadingView.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Showing PDF preview in reading view:', preview);
                        preview.style.display = '';
                    }
                });
            }
        });
    }

    hideNewPDFPreviews(nodes: NodeList) {
        nodes.forEach((node) => {
            if (node instanceof HTMLElement) {
                const pdfPreviews = node.querySelectorAll('div.textLayer, span.pdf-embed');
                pdfPreviews.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Hiding new PDF preview:', preview);
                        preview.style.display = 'none';
                    }
                });
            }
        });
    }

    onunload() {
        console.log('Unloading plugin');
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        console.log('Settings loaded:', this.settings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
        console.log('Settings saved:', this.settings);
    }
}
