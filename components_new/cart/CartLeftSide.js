import React, { memo, useContext } from 'react'
import SessionContext from 'react-storefront/session/SessionContext'
import CartIcon from '../assets/cart_icon.svg'
import EmptyLeftCart from '../assets/empty_left_cart.png'
import ButtonArrowRound from '../assets/button_arrow_round.svg'
import get from 'lodash/get'
import { useForm } from 'react-hook-form'

const CartLeftSide = () => {
  const { session, actions } = useContext(SessionContext)
  const items = get(session, 'cart.items')
  console.log(items)

  const { register, handleSubmit } = useForm()
  const onSubmit = (data) => console.log(JSON.stringify(data))

  return (
    <div className="mt-2">
      <div className="border border-primary px-5 py-7 rounded-[15px]">
        <div className="border-b-2 border-primary flex items-center justify-between pb-4">
          <div>
            <span className="font-bold mr-1 text-xl">Корзина</span>
            {items.length > 0 && (
              <span className="font-bold text-[18px] text-primary">
                ({items.length})
              </span>
            )}
          </div>
          <div>
            <CartIcon />
          </div>
        </div>

        <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm">
          <EmptyLeftCart />
          <div>
            Корзина пуста <br />
            Выберите пиццу
          </div>
        </div>
      </div>
      <div className="border border-primary mt-3 p-5 rounded-[15px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex">
          <input
            type="text"
            placeholder="Промокод"
            {...register('discount_code')}
            className="bg-gray-100 focus:outline-none outline-none px-5 py-2 rounded-full text-xs w-full"
          />
          <button className="-m-8 focus:outline-none outline-none">
            <ButtonArrowRound />
          </button>
        </form>
      </div>
    </div>
  )
}

export default memo(CartLeftSide)
