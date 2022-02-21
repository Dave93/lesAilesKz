import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'

const Delivery: FC = () => {
  return (
    <div className="mx-5 md:mx-0">
      <div className="mb-10">
        <div className="text-2xl md:text-3xl mb-1">
          Доставка в Chopar Pizza ежедневно с 10:00 до 03:00{' '}
          <a href="tel:9989712051111" className="hover:text-blue">
            +998971 205 11 11
          </a>
        </div>
        <div className="border-b-2 w-24 border-primary mb-10"></div>
        <Image
          src="/banner.png"
          layout="responsive"
          width={1160}
          height={270}
        />
      </div>
      <div className="mb-10">
        <div className="text-2xl mb-1">Как сделать заказ в Chopar Pizza </div>
        <div className="md:w-[800px]">
          Достаточно просто выбрать заинтересовавшие вас блюда из меню и
          добавить их в корзину (нажимайте на кнопку с ценой рядом с каждым
          блюдом — оно будет добавлено в Ваш заказ), затем щёлкнуть по
          изображению корзины в правом верхнем углу сайта и далее следовать
          простым инструкциям по заполнению формы заказа.
        </div>
        <div className="md:grid grid-cols-4 mt-10 space-y-4 md:space-y-0">
          <div className="flex">
            <div>
              <img src="/decorOrder.png" alt="" />
            </div>
            <div className="ml-3 w-7/12">
              <div className="leading-6 text-xl ">Оформление заказа</div>
              <div className="text-xs text-gray-400">
                Делайте заказ на сайте
              </div>
            </div>
          </div>
          <div className="flex">
            <div>
              <img src="/confirmOrder.png" alt="" />
            </div>
            <div className="ml-3  w-7/12">
              <div className="leading-6 text-xl">Подтверждение заказа</div>
              <div className="text-xs text-gray-400">
                С вами свяжеться менеджер
              </div>
            </div>
          </div>
          <div className="flex">
            <div>
              <img src="/deliveryIcon.png" alt="" />
            </div>
            <div className="ml-3 w-7/12">
              <div className="leading-6 text-xl">Доставка</div>
              <div className="text-xs text-gray-400">
                Оплачываете заказ удобным для Вас способом
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="text-2xl md:text-3xl mb-1">Зона доставки </div>
        <div className="border-b-2 w-24 border-primary mb-10"></div>
        <Image
          src="/orderZone.png"
          layout="responsive"
          width={2132}
          height={1075}
        />
        <div className="border border-primary md:flex justify-between md:mt-2 mt-5 py-5 px-8 rounded-xl">
          <div className="md:flex mb-4 md:mb-0">
            <div className="w-2/12">
              <img src="zoneA.png" />
            </div>
            <div className="">
              <span className="text-green-500">Зона А:</span> При доставке по
              Ташкенту минимальная сумма заказа составляет 60 000 сум, среднее
              время доставки 40 минут
            </div>
          </div>
          <div className="md:flex">
            <div className="w-2/12">
              <img src="zoneB.png" />
            </div>
            <div className="">
              <span className="text-primary">Зона B:</span> При доставке по ТКАД
              минимальная сумма заказа составляет 100 000 сум, среднее время
              доставки – 60 минут
            </div>
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="text-2xl md:text-3xl mb-1">Способы оплаты </div>
        <div className="border-b-2 w-24 border-primary mb-10"></div>
        <div className="md:grid grid-cols-3 mt-10">
          <div className="md:flex mb-4">
            <div>
              <img src="/cashPayment.jpg" alt="" width="60px" height="60px" />
            </div>
            <div className="md:md:ml-4 md:w-56">
              <div className="text-xl ">Оплата наличными</div>
              <div className="md:text-xs text-gray-400">
                Для выбора оплаты товара наличными на странице заказа необходимо
                выбрать пункт "Наличными при получении". Вы сможете оплатить
                товар в нашем пункте самовывоза или при доставке курьером,
                оплата осуществляется наличными курьеру в руки.
              </div>
            </div>
          </div>
          <div className="md:flex mb-4">
            <div>
              <img src="/cardPayment.jpg" alt="" width="60px" height="60px" />
            </div>
            <div className="md:ml-4  md:w-56">
              <div className="text-xl">Оплата картой</div>
              <div className="md:text-xs text-gray-400">
                Для выбора оплаты товара картой при получении, на странице
                заказа необходимо выбрать пункт "Картой при получении". Вы
                сможете оплатить товар в нашем пункте самовывоза или при
                доставке курьером, оплата курьеру осущетвляеться с помощью
                переносного терминала оплаты.
              </div>
            </div>
          </div>
          <div className="md:flex mb-4">
            <div>
              <img src="/onlinePayment.jpg" alt="" width="60px" height="60px" />
            </div>
            <div className="md:ml-4 md:w-56">
              <div className="text-xl">Онлайн оплата</div>
              <div className="md:text-xs text-gray-400">
                Для выбора оплаты товара картой при получении, на странице
                заказа необходимо выбрать пункт онлайн оплата Pay-me, Click. Вы
                сможете оплатить товар в нашем пункте самовывоза или при
                доставке курьером, оплата курьеру осущетвляеться с помощью
                переносного терминала оплаты.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Delivery)
