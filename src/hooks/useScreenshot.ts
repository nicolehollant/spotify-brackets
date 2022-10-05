import { useState } from 'react'
import html2canvas from 'html2canvas'

/**
 * @module Main_Hook
 * Hook return
 * @typedef {Array} HookReturn
 * @property {string} HookReturn[0] - image string
 * @property {string} HookReturn[1] - take screen shot string
 * @property {object} HookReturn[2] - errors
 */

/**
 * hook for creating screenshot from html node
 * @returns {HookReturn}
 */
const useScreenshot = ({ type, quality }: { type: string; quality: number } = { type: 'PNG', quality: 1 }) => {
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  /**
   * convert html node to image
   * @param {HTMLElement} node
   */
  const takeScreenShot = async (node: HTMLElement) => {
    if (!node) {
      throw new Error('You should provide correct html node.')
    }
    const canvas = await html2canvas(node, { allowTaint: true, backgroundColor: '000000', useCORS: true })
    const croppedCanvas = document.createElement('canvas')
    const croppedCanvasContext = croppedCanvas.getContext('2d')
    // init data
    const cropPositionTop = 0
    const cropPositionLeft = 0
    const cropWidth = canvas.width
    const cropHeight = canvas.height

    croppedCanvas.width = cropWidth
    croppedCanvas.height = cropHeight

    croppedCanvasContext?.drawImage(canvas, cropPositionLeft, cropPositionTop)

    const base64Image = croppedCanvas.toDataURL(type, quality)

    setImage(base64Image)
    return base64Image
  }

  const downloadToFile = (content: string, filename: string, contentType: string) => {
    const download = document.createElement('a')
    download.href = content
    download.download = filename
    download.click()
  }

  const takeScreenShotAndSave = async (node: HTMLElement, filename: string) => {
    const contents = await takeScreenShot(node)
    downloadToFile(contents, filename, type)
  }

  return {
    image,
    takeScreenShot,
    error,
    takeScreenShotAndSave,
  }
}

/**
 * creates name of file
 * @param {string} extension
 * @param  {string[]} parts of file name
 */
const createFileName = (extension = '', ...names: string[]) => {
  if (!extension) {
    return ''
  }

  return `${names.join('')}.${extension}`
}

export { useScreenshot, createFileName }
