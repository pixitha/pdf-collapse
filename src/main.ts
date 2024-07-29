import { App, Plugin, PluginSettingTab, Setting, MarkdownView } from 'obsidian';

interface PDFCollapseSettings {
    hidePDFPreviews: boolean;
}

const DEFAULT_SETTINGS: PDFCollapseSettings = {
    hidePDFPreviews: false,
};

export default class PDFCollapsePlugin extends Plugin {
    settings: PDFCollapseSettings;
    private observer: MutationObserver | null = null;
    private ribbonIconEl: HTMLElement | null = null;

    async onload() {
        console.log('Loading plugin');
        await this.loadSettings();

        this.addCommand({
            id: 'toggle-hide-pdf-previews',
            name: 'Toggle Hide PDF Previews',
            callback: () => this.toggleHidePDFPreviews()
        });

        this.initMutationObserver();

        if (this.settings.hidePDFPreviews) {
            this.hideAllPDFPreviews();
        }

        this.addOrUpdateRibbonIcon();
    }

    addOrUpdateRibbonIcon() {
        if (!this.ribbonIconEl) {
            this.ribbonIconEl = this.addRibbonIcon(
                this.settings.hidePDFPreviews ? 'eye-off' : 'eye',
                this.settings.hidePDFPreviews ? 'Show PDF Previews' : 'Hide PDF Previews',
                () => this.toggleHidePDFPreviews()
            );
        } else {
            const iconClass = this.settings.hidePDFPreviews ? 'eye-off' : 'eye';
            const iconTitle = this.settings.hidePDFPreviews ? 'Show PDF Previews' : 'Hide PDF Previews';
            
            this.ribbonIconEl.setAttr('title', iconTitle);
            this.ribbonIconEl.empty();
            this.ribbonIconEl.createSpan({ cls: 'icon', attr: { 'aria-hidden': 'true' } }).addClass(iconClass);
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

        this.addOrUpdateRibbonIcon();
    }

    async hideAllPDFPreviews() {
        console.log('Attempting to hide all PDF previews...');
        const markdownViews = this.app.workspace.getLeavesOfType('markdown').map(leaf => leaf.view);
        markdownViews.forEach((view) => {
            if (view instanceof MarkdownView) {
                const contentEl = view.contentEl;

                const pdfPreviewsEditorView = contentEl.querySelectorAll('div.internal-embed.pdf-embed.is-loaded');
                pdfPreviewsEditorView.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Hiding PDF preview in editor view:', preview);
                        preview.style.display = 'none';
                    } else {
                        console.log('Editor view PDF preview not found:', preview);
                    }
                });

                const pdfPreviewsReadingView = contentEl.querySelectorAll('span.pdf-embed');
                pdfPreviewsReadingView.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Hiding PDF preview in reading view:', preview);
                        preview.style.display = 'none';
                    } else {
                        console.log('Reading view PDF preview not found:', preview);
                    }
                });
            }
        });
    }

    async showAllPDFPreviews() {
        console.log('Attempting to show all PDF previews...');
        const markdownViews = this.app.workspace.getLeavesOfType('markdown').map(leaf => leaf.view);
        markdownViews.forEach((view) => {
            if (view instanceof MarkdownView) {
                const contentEl = view.contentEl;

                const pdfPreviewsEditorView = contentEl.querySelectorAll('div.internal-embed.pdf-embed.is-loaded');
                pdfPreviewsEditorView.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Showing PDF preview in editor view:', preview);
                        preview.style.display = '';
                    } else {
                        console.log('Editor view PDF preview not found:', preview);
                    }
                });

                const pdfPreviewsReadingView = contentEl.querySelectorAll('span.pdf-embed');
                pdfPreviewsReadingView.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Showing PDF preview in reading view:', preview);
                        preview.style.display = '';
                    } else {
                        console.log('Reading view PDF preview not found:', preview);
                    }
                });
            }
        });
    }

    hideNewPDFPreviews(nodes: NodeList) {
        nodes.forEach((node) => {
            if (node instanceof HTMLElement) {
                const pdfPreviews = node.querySelectorAll('div.internal-embed.pdf-embed.is-loaded, span.pdf-embed');
                pdfPreviews.forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        console.log('Hiding new PDF preview:', preview);
                        preview.style.display = 'none';
                    } else {
                        console.log('New PDF preview not found:', preview);
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
