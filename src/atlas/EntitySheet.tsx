import { usePanelInteraction } from './usePanelInteraction';
import type { PropsWithChildren, ReactNode } from 'react';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { theme } from '../theme/tokens';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function EntitySheet({
  children,
  title,
  wide,
  onClose,
  nonmodal = false,
  focusClose = true,
  presentation = 'detail',
  headerAction,
  compact = false,
}: PropsWithChildren<{
  title: string;
  wide: boolean;
  onClose: () => void;
  nonmodal?: boolean;
  focusClose?: boolean;
  presentation?: 'detail' | 'tools';
  headerAction?: ReactNode;
  compact?: boolean;
}>) {
  const [shown, setShown] = useState(false);
  const { height } = useWindowDimensions();
  const [availableHeight, setAvailableHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  usePanelInteraction(nonmodal, onClose);
  const content = (
    <KeyboardAvoidingView
      pointerEvents={nonmodal ? 'box-none' : 'auto'}
      style={[
        styles.scrim,
        (nonmodal || (wide && presentation === 'detail')) && { backgroundColor: 'transparent' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        pointerEvents={nonmodal ? 'box-none' : 'auto'}
        style={[
          styles.position,
          wide ? styles.right : styles.bottom,
          presentation === 'tools' && styles.toolsPosition,
        ]}
      >
        <SafeAreaView
          style={[
            styles.card,
            nonmodal &&
              !wide && {
                height: expanded ? '80%' : '38%',
                minHeight: Math.min(availableHeight || height, height < 500 ? 160 : 240),
                maxHeight: '100%',
              },
            wide && styles.desktop,
            presentation === 'tools' && styles.toolsCard,
            compact && { height: 'auto', minHeight: 0, maxHeight: '65%' },
          ]}
          testID={presentation === 'tools' ? 'timeline-tools-dialog' : undefined}
          edges={nonmodal ? ['left', 'right'] : ['top', 'bottom', 'left', 'right']}
          accessibilityViewIsModal={!nonmodal}
        >
          <View style={[s.row, styles.header]}>
            <AppText variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
              {title}
            </AppText>
            {headerAction}
            <Action
              label={t('atlas.close')}
              symbol="×"
              iconOnly
              onPress={onClose}
              autoFocus={focusClose && (shown || nonmodal)}
            />
          </View>
          {nonmodal && !wide && !compact && (
            <Action
              label={t(expanded ? 'panel.collapse' : 'panel.expand')}
              symbol={expanded ? '⌄' : '⌃'}
              onPress={() => setExpanded((v) => !v)}
            />
          )}
          <ScrollView
            style={compact ? { flexGrow: 0 } : undefined}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.panel}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
  return nonmodal ? (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      onLayout={(event) => setAvailableHeight(event.nativeEvent.layout.height)}
    >
      {content}
    </View>
  ) : (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      onShow={() => setShown(true)}
    >
      {content}
    </Modal>
  );
}
const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: theme.colors.scrim },
  position: { flex: 1 },
  right: { alignItems: 'flex-end', justifyContent: 'flex-start' },
  bottom: { justifyContent: 'flex-end' },
  card: {
    width: '100%',
    height: '75%',
    maxHeight: '85%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    flexShrink: 1,
  },
  desktop: {
    width: theme.layout.panelWidth,
    maxHeight: '100%',
    height: '100%',
    borderTopRightRadius: 0,
  },
  header: { padding: theme.spacing.md, borderBottomWidth: 1, borderColor: theme.colors.border },
  toolsPosition: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  toolsCard: {
    width: '100%',
    maxWidth: 520,
    height: 'auto',
    maxHeight: '90%',
    borderRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
});
