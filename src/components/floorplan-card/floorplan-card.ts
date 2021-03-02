import { HomeAssistant } from '../../lib/homeassistant/types';
import { LovelaceCard } from '../../lib/homeassistant/panels/lovelace/types';
import { LovelaceCardConfig } from '../../lib/homeassistant/data/lovelace';
import {
  css,
  CSSResult,
  html,
  LitElement,
  property,
  TemplateResult,
  PropertyValues,
} from 'lit-element';
import { ShadowDomHelper } from './../floorplan/lib/shadow-dom-helper';
import '../floorplan/floorplan-element';
import { styleMap, StyleInfo } from 'lit-html/directives/style-map';

export class FloorplanCard extends LitElement implements LovelaceCard {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public isPanel!: boolean;
  @property({ type: Boolean }) public editMode!: boolean;

  @property({ type: Object }) public config!: LovelaceCardConfig;

  @property({ type: String }) public examplespath!: string;
  @property({ type: Boolean }) public isDemo!: boolean;
  @property({ type: Function }) public notify!: (message: string) => void;

  styles: StyleInfo = { dummy: '' };

  static cardHeaderHeight = 76;

  protected render(): TemplateResult {
    if (!this.config) {
      return html``;
    }

    return html`
      <ha-card>
        ${this.isDisplayCardHeader
          ? html` <h1 class="card-header">${this.config?.title}</h1> `
          : ''}

        <div class="content" style=${styleMap(this.styles)}>
          <floorplan-element
            .examplespath=${this.examplespath}
            .hass=${this.hass}
            ._config=${this.config?.config}
            .isDemo=${this.isDemo}
            .notify=${this.notify}
          ></floorplan-element>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      /* header (main toolbar) */
      /* --header-height: 56px; */

      /* card header */
      /* height: 76px; */

      :host .content,
      :host .content floorplan-element {
        display: flex;
        flex-flow: column;
        flex: 1;
        min-height: 0;
      }
    `;
  }

  get isFullHeight(): boolean {
    return this.config?.full_height;
  }

  get view(): Element | null | undefined {
    return ShadowDomHelper.closestElement('#view', this);
  }

  get appHeader(): Element | null | undefined {
    return this.view?.previousElementSibling;
  }

  get appHeaderHeight(): number {
    if (this.isDemo) return 0;
    const appHeader = this.appHeader;
    return appHeader ? appHeader.clientHeight : 0;
  }

  get cardHeaderHeight(): number {
    if (this.isDemo) return 0;
    return this.isDisplayCardHeader ? FloorplanCard.cardHeaderHeight : 0;
  }

  get isDisplayCardHeader(): boolean {
    if (this.isDemo) return false;
    return (this.config?.title as string)?.trim().length > 0;
  }

  getCardSize(): number | Promise<number> {
    return 1;
  }

  setConfig(config: LovelaceCardConfig): void {
    this.config = config;
  }

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);

    if (changedProperties.has('config')) {
      if (this.isFullHeight) {
        this.styles = {
          height: `calc(100vh - ${this.appHeaderHeight}px - ${this.cardHeaderHeight}px)`,
        };
      } else {
        this.styles = { dummy: '' };
      }
    }
  }
}

if (!customElements.get('floorplan-card')) {
  customElements.define('floorplan-card', FloorplanCard);
}
