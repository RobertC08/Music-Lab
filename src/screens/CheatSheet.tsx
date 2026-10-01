import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { colors, font, rhythmTheme } from '../theme'
import { Card, PageTitle, Pill } from '../components/ui'
import { NoteSymbol, type NoteKind } from '../components/notation'
import { DurationStack, RhythmLine } from '../components/rhythm-line'
import { rhythmCategory } from '../curriculum/rhythm'

/** Un rand din tabelul de valori. */
interface ValueRow {
  kind: NoteKind
  name: string
  duration: string
  counted: string
}

const noteRows: ValueRow[] = [
  { kind: 'half', name: 'Doime', duration: '2 timpi', counted: '„unu-doi"' },
  { kind: 'quarter', name: 'Pătrime', duration: '1 timp', counted: '„unu"' },
  { kind: 'eighth', name: 'Optime', duration: '½ timp', counted: '„unu" sau „și"' },
  { kind: 'sixteenth', name: 'Șaisprezecime', duration: '¼ de timp', counted: 'o silabă' },
]

const dottedRows: ValueRow[] = [
  {
    kind: 'dottedQuarter',
    name: 'Pătrime punctată',
    duration: '1 timp și ½',
    counted: 'punctul adaugă jumătate',
  },
  {
    kind: 'dottedEighth',
    name: 'Optime punctată',
    duration: '¾ de timp',
    counted: 'urmată de o șaisprezecime',
  },
]

const groupRows: ValueRow[] = [
  { kind: 'eighthPair', name: 'Două optimi', duration: '1 timp împreună', counted: '„unu-și"' },
  {
    kind: 'tripletEighths',
    name: 'Triolet',
    duration: '1 timp împreună',
    counted: '„tri-o-let" · cifra 3 deasupra',
  },
  {
    kind: 'sextoletSixteenths',
    name: 'Sextolet',
    duration: '1 timp împreună',
    counted: '„tri-o-let tri-o-let" · cifra 6 deasupra',
  },
  {
    kind: 'sixteenthGroup',
    name: 'Patru șaisprezecimi',
    duration: '1 timp împreună',
    counted: '„unu-e-și-a"',
  },
  {
    kind: 'tiedQuarters',
    name: 'Note legate',
    duration: 'durata însumată',
    counted: 'ataci doar prima',
  },
]

const restRows: ValueRow[] = [
  { kind: 'halfRest', name: 'Pauză de doime', duration: '2 timpi', counted: 'tăcere' },
  { kind: 'quarterRest', name: 'Pauză de pătrime', duration: '1 timp', counted: 'tăcere' },
  { kind: 'eighthRest', name: 'Pauză de optime', duration: '½ timp', counted: 'tăcere' },
]

export function CheatSheet({ onExit }: { onExit: () => void }) {
  const [highlight, setHighlight] = useState<'quarter' | 'eighth' | 'sixteenth'>('quarter')

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 60,
        gap: 18,
        width: '100%',
        maxWidth: 620,
        alignSelf: 'center',
      }}
    >
      <Pressable accessibilityRole="button" onPress={onExit} hitSlop={12}>
        <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.muted }}>
          ‹ Înapoi
        </Text>
      </Pressable>

      <PageTitle
        eyebrow="Ritm"
        title="Cheat sheet"
        subtitle="Tot ce ai nevoie într-un singur loc. Revino aici oricând uiți un simbol."
      />

      <Card style={{ gap: 14 }}>
        <DurationStack highlight={highlight} accentColor={rhythmTheme.accent} />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {(
            [
              ['quarter', 'Pătrimi'],
              ['eighth', 'Optimi'],
              ['sixteenth', 'Șaisprezecimi'],
            ] as const
          ).map(([value, label]) => (
            <Pill
              key={value}
              label={label}
              selected={highlight === value}
              onPress={() => setHighlight(value)}
            />
          ))}
        </View>
      </Card>

      <ValueTable title="NOTE" rows={noteRows} />
      <ValueTable title="PAUZE" rows={restRows} />
      <ValueTable title="CU PUNCT" rows={dottedRows} />
      <ValueTable title="GRUPURI ȘI LEGĂTURI" rows={groupRows} />

      <Card style={{ gap: 12 }}>
        <Text style={{ fontFamily: font, fontSize: 13, fontWeight: '800', color: colors.muted }}>
          AȘA ARATĂ ÎMPREUNĂ
        </Text>
        <RhythmLine
          tokens={['quarter', 'eighthPair', 'tripletEighths', 'sixteenthGroup']}
          height={40}
        />
        <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 21, color: colors.muted }}>
          O măsură de 4/4: o pătrime, două optimi, un triolet și patru
          șaisprezecimi. Fiecare grup ocupă exact un timp, se schimbă doar în
          câte părți e împărțit.
        </Text>
      </Card>

      <Card style={{ gap: 16 }}>
        <Text style={{ fontFamily: font, fontSize: 13, fontWeight: '800', color: colors.muted }}>
          TERMENI
        </Text>
        {/*
          Termenii vin din lectii, nu dintr-o lista tinuta separat. Asa cheat
          sheet-ul nu mai poate ramane in urma cand adaugam o lectie noua.
        */}
        {rhythmCategory.lessons.map((lesson, index) =>
          lesson.reference.map((item) => (
            <View key={`${lesson.id}-${item.term}`} style={{ gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}
                >
                  {item.term}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 6,
                    backgroundColor: rhythmTheme.soft,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: font,
                      fontSize: 11,
                      fontWeight: '800',
                      color: '#A94F00',
                    }}
                  >
                    LECȚIA {index + 1}
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
                {item.meaning}
              </Text>
            </View>
          )),
        )}
      </Card>
    </ScrollView>
  )
}

function ValueTable({ title, rows }: { title: string; rows: ValueRow[] }) {
  return (
    <Card style={{ gap: 4 }}>
      <Text
        style={{
          fontFamily: font,
          fontSize: 13,
          fontWeight: '800',
          color: colors.muted,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      {rows.map((row, index) => (
        <View
          key={row.name}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingVertical: 10,
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: '#EEF1F3',
          }}
        >
          <View style={{ width: 74, alignItems: 'center' }}>
            <NoteSymbol kind={row.kind} height={40} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
              {row.name}
            </Text>
            <Text style={{ fontFamily: font, fontSize: 14, color: colors.muted }}>
              {row.duration} · {row.counted}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  )
}
