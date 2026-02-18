import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { baseStyles } from '../theme'

export const RunningHeader = ({ left, right }: { left: string; right: string }) => (
  <View style={baseStyles.runningHeader} fixed>
    <Text style={baseStyles.runningHeaderText}>{left}</Text>
    <Text style={baseStyles.runningHeaderText}>{right}</Text>
  </View>
)
