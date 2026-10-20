import { PrivacyPolicy } from './PrivacyPolicy';
import { View } from 'react-native';
import type { Preferences } from '../preferences/model';
import type { PreferenceSnapshot } from '../preferences/store';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function SettingsPanel({
  state,
  onChange,
  onRetry,
  onReset,
  onAttribution,
}: {
  state: PreferenceSnapshot;
  onChange: (patch: Partial<Preferences>) => void;
  onRetry: () => void;
  onReset: () => void;
  onAttribution: () => void;
}) {
  const disabled = state.status !== 'ready';
  return (
    <View style={s.stack} testID="settings-panel">
      <AppText variant="heading" accessibilityRole="header">
        {t('layers.settings')}
      </AppText>
      <AppText>{t('settings.fixed')}</AppText>
      <View style={s.row}>
        {(['system', 'reduce'] as const).map((motion) => (
          <Action
            key={motion}
            label={t(motion === 'system' ? 'settings.motion.system' : 'settings.motion.reduce')}
            disabled={disabled}
            selected={state.value.motion === motion}
            onPress={() => onChange({ motion })}
          />
        ))}
      </View>
      <AppText>{t('settings.motion.notice')}</AppText>
      <AppText accessibilityLiveRegion="polite">
        {t(
          state.status === 'loading'
            ? 'settings.loading'
            : state.status === 'read-error'
              ? 'settings.readError'
              : state.writeError
                ? 'settings.writeError'
                : state.saving
                  ? 'settings.saving'
                  : 'settings.saved',
        )}
      </AppText>
      {(state.status === 'read-error' || state.writeError) && (
        <Action label={t('settings.retry')} onPress={onRetry} />
      )}
      <Action label={t('settings.reset')} disabled={state.status === 'loading'} onPress={onReset} />
      <AppText>{t('settings.resetNotice')}</AppText>
      <Action label={t('globe.licenses')} onPress={onAttribution} />
      <AppText variant="heading" accessibilityRole="header">
        {t('settings.privacyTitle')}
      </AppText>
      <AppText>{t('settings.privacy')}</AppText>
      <PrivacyPolicy />
      <AppText>{t('settings.errors')}</AppText>
    </View>
  );
}
