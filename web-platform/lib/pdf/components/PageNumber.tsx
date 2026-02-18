import React from 'react'
import { Text } from '@react-pdf/renderer'
import { baseStyles } from '../theme'

export const PageNumber = () => (
  <Text
    style={baseStyles.pageFooter}
    fixed
    render={({ pageNumber }) => (pageNumber > 1 ? String(pageNumber) : '')}
  />
)
