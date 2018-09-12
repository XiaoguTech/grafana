import React, { PureComponent } from 'react';
import Highlighter from 'react-highlight-words';
import classNames from 'classnames/bind';
import { AlertRule } from '../../types';

export interface Props {
  rule: AlertRule;
  search: string;
  onTogglePause: () => void;
}

class AlertRuleItem extends PureComponent<Props> {
  renderText(text: string) {
    return (
      <Highlighter
        highlightClassName="highlight-search-match"
        textToHighlight={text}
        searchWords={[this.props.search]}
      />
    );
  }

  render() {
    const { rule, onTogglePause } = this.props;

    const stateClass = classNames({
      fa: true,
      'fa-play': rule.state === 'paused',
      'fa-pause': rule.state !== 'paused',
    });

    const ruleUrl = `${rule.url}?panelId=${rule.panelId}&fullscreen=true&edit=true&tab=alert`;

    return (
      <li className="alert-rule-item">
        <span className={`alert-rule-item__icon ${rule.stateClass}`}>
          <i className={rule.stateIcon} />
        </span>
        <div className="alert-rule-item__body">
          <div className="alert-rule-item__header">
            <div className="alert-rule-item__name">
              <a href={ruleUrl}>{this.renderText(rule.name)}</a>
            </div>
            <div className="alert-rule-item__text">
              <span className={`${rule.stateClass}`}>{this.renderText(rule.stateText)}</span>
              <span className="alert-rule-item__time"> for {rule.stateAge}</span>
            </div>
          </div>
          {rule.info && <div className="small muted alert-rule-item__info">{this.renderText(rule.info)}</div>}
        </div>

        <div className="alert-rule-item__actions">
          <button
            className="btn btn-small btn-inverse alert-list__btn width-2"
            title="暂停此告警规则以阻止其执行"
            onClick={onTogglePause}
          >
            <i className={stateClass} />
          </button>
          <a className="btn btn-small btn-inverse alert-list__btn width-2" href={ruleUrl} title="编辑此告警规则">
            <i className="icon-gf icon-gf-settings" />
          </a>
        </div>
      </li>
    );
  }
}

export default AlertRuleItem;
