import { useState, type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { t } from '../i18n';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
/** Keep source material available without making the short map card a document. */
export function RecordDetails({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.stack}>
      <Action
        label={t('record.sourceDetails')}
        symbol={open ? '−' : '+'}
        selected={open}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <View style={s.stack} testID="record-details">
          {children}
        </View>
      )}
    </View>
  );
}
