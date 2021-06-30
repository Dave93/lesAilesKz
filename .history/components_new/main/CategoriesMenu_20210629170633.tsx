import { FC, memo } from 'react'

const CategoriesMenu: FC = () => {
    return (
      <div className="container m-auto">
        <div className="bg-white flex h-14 items-center justify-between px-36 rounded-xl shadow-lg w-full">
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            ПИЦЦА
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            СЭТЫ
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            ЗАКУСКИ
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            СОУСЫ
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            САЛАТЫ
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            НАПИТКИ
          </div>
        </div>
      </div>
    )
}

export default memo(CategoriesMenu)
