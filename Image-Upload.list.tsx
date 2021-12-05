import React, { useState } from 'react';
import { Box } from '@admin-bro/design-system';
import { BasePropertyProps } from 'admin-bro';
import Zoom from 'react-medium-image-zoom'


// COMPONENTE PARA FAZER UPLOAD E MOSTRAR A IMAGEM DENTRO DO FORMULÁRIO

const Edit: React.FC<BasePropertyProps> = (props) => {
  const { record } = props
  const srcImg = record.params['imagens']
  const [fullScreen, setfullScreen] = useState(false)

  return (
    <Box onClick={ () => setfullScreen(!fullScreen)}>
      {srcImg ? fullScreen? <img src={srcImg} style={{cursor:'zoom-out',position: "absolute",
  top: '25%',
  left: '25%',
  width:'780px',
  height:'500px',
  background: 'white'}}/>: <img style={{cursor:'zoom-in'}} width='70px' src={srcImg} /> : 'sem imagem'}
    </Box>
  )
};

export default Edit