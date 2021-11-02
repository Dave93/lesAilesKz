import React, { memo, FC } from 'react'

type TitleProps = {
  title: string
}

const ProductListSectionTitle: FC<TitleProps> = ({ title = '' }) => {
  return (
    <h3 className="text-gray-800 py-1 text-4xl w-max mb-10 ml-4 md:ml-0 mt-10">
      {title}
    </h3>
  )
}

export default memo(ProductListSectionTitle)
