import { PluginSettingTab, App, Setting } from 'obsidian';
import PDFCollapsePlugin from './main';

// Plugin settings interface
export interface PDFCollapseSettings {
    hidePDFPreviews: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: PDFCollapseSettings = {
    hidePDFPreviews: false,
};

// Settings tab
export class PDFCollapseSettingTab extends PluginSettingTab {
    plugin: PDFCollapsePlugin;

    constructor(app: App, plugin: PDFCollapsePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'PDF Collapse Plugin Settings' });

        new Setting(containerEl)
            .setName('Hide PDF Previews')
            .setDesc('Automatically hide all PDF previews in notes.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.hidePDFPreviews)
                .onChange(async (value) => {
                    this.plugin.settings.hidePDFPreviews = value;
                    await this.plugin.saveSettings();

                    if (value) {
                        this.plugin.hideAllPDFPreviews();
                    } else {
                        this.plugin.showAllPDFPreviews();
                    }
                }));
    }
}
