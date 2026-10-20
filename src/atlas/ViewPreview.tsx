import { View } from 'react-native';
import { pilotSearch } from '../data/application';
import type { SavedView } from '../discovery/view';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { yearLabel } from './yearLabel';
import { atlasStyles as s } from './styles';
export function ViewPreview({ view, onApply }: { view: SavedView; onApply: () => void }) {
  return (
    <View style={s.stack} testID="view-preview">
      <AppText>
        {t('share.preview')} {yearLabel(view.year)}
      </AppText>
      <AppText>{t('map.globeOnly')}</AppText>
      {view.entityId && (
        <AppText>{pilotSearch?.get(view.entityId)?.name ?? t('search.missing')}</AppText>
      )}
      {view.camera && (
        <AppText>
          {t('share.camera')} {view.camera.center.lat.toFixed(4)},{' '}
          {view.camera.center.lng.toFixed(4)} · {view.camera.zoom.toFixed(2)}
        </AppText>
      )}
      <AppText>{t('share.applyNotice')}</AppText>
      <Action label={t('share.apply')} onPress={onApply} />
    </View>
  );
}
