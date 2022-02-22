import { FC, memo } from 'react'
import Image from 'next/image'

const Fran: FC = () => {
  return (
    <div className="mx-5 md:mx-0">
      <div className="text-3xl mb-1">Франшиза</div>
      <div className="border-b-2 w-24 border-primary mb-10"></div>
      <div className="mb-16">
        <div className="md:grid grid-cols-3">
          <div className="col-span-2 md:md:text-xl">
            <div className="text-2xl md:text-5xl text-primary font-bold mb-10">
              Льготные условия франчайзинга на 2021 год
            </div>
            <div className="mb-6 font-bold">Открыть пиццерию</div>
            <div className="mb-6">
              Паушальный взнос - 800 000 рублей за каждый ресторан.
            </div>
            <div className="mb-6">
              Роялти - 5% от ежемесячной выручки точки в течение первого года со
              дня открытия ресторана, начиная с 13 месяца размер роялти составит
              7%.
            </div>
            <div className="mb-10">Окупаемость от 2-х лет.</div>
            <div className="mb-6 font-bold">Купить действующую пиццерию:</div>
            <div className="mb-6">
              Ознакомиться со всеми условиями франчайзинга вы можете по телефону
              71-200-42-42
            </div>
          </div>
        </div>
      </div>
      <div className="mb-16">
        <div className="text-2xl md:text-5xl text-primary font-bold mb-10">
          форматы ресторанов на выбор:
        </div>
        <div className="md:grid grid-cols-3">
          <div>
            <Image
              src="/bigRest.png"
              width="360"
              height="254"
              className="rounded-2xl mb-2"
            />
            <div className="text-2xl font-bold mt-7 mb-5">Большой ресторан</div>
            <div className="md:md:text-xl md:w-80 mb-5 md:mb-0">
              <div className="mb-5">
                Ресторан с полноценным залом и доставкой на дом.
              </div>
              <div className="mb-5">
                Более 100 посадочных мест, возможно размещение детского игрового
                комплекса или бара с крепким алкоголем
              </div>
              <div className="mb-5">
                <span className="font-bold">Площадь</span> от 170 м²
              </div>
              <div>
                <div className="font-bold">Среднемесячный оборот</div> 150 000
                000 сум
              </div>
            </div>
          </div>
          <div>
            <Image
              src="/middleRest.png"
              width="360"
              height="254"
              className="rounded-2xl"
            />
            <div className="text-2xl font-bold mt-7 mb-5">Средний ресторан</div>
            <div className="md:text-xl md:w-80 mb-5 md:mb-0">
              <div className="mb-5">
                Зал от 20 до 100 посадочных мест и доставка на дом. Площадь
                Среднемесячный оборот
              </div>
              <div className="mb-5">
                <span className="font-bold">Площадь</span> от 130 до 170 м²
              </div>
              <div>
                <div className="font-bold">Среднемесячный оборот</div> 100 000
                000 сум
              </div>
            </div>
          </div>
          <div>
            <Image
              src="/smallRest.png"
              width="360"
              height="254"
              className="rounded-2xl"
            />
            <div className="text-2xl font-bold mt-7 mb-5">
              Маленький ресторан
            </div>
            <div className="md:text-xl md:w-80 mb-5 md:mb-0">
              <div className="mb-5">
                Ресторан, работающий только на доставку и самовывоз, посадочные
                места в зале отсутствуют
              </div>
              <div className="mb-5">
                <span className="font-bold">Площадь</span> от 80 до 130 м²
              </div>
              <div>
                <div className="font-bold">Среднемесячный оборот</div> 80 000
                000 сум
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-16">
        <div className="text-2xl md:text-5xl text-primary font-bold mb-10">
          О нашей пицце
        </div>
        <div className="md:grid grid-cols-3 mb-10">
          <div className="col-span-2">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content
            here', making it look like readable English.
          </div>
        </div>
        <div>
          <Image
            src="/aboutPizza.png"
            width="1160"
            height="571"
            className="rounded-2xl"
          />
        </div>
      </div>
      <div className="mb-16">
        <div className="text-2xl md:text-5xl text-primary font-bold mb-10 md:w-7/12">
          А самые главные секреты восхитительного вкуса
        </div>
        <div className="md:grid md:grid-cols-3">
          <div>
            <Image
              src="/taste.png"
              width="360"
              height="254"
              className="rounded-2xl mb-2"
            />
            <div className="text-2xl font-bold mt-7 mb-5">
              Всегда свежее тесто
            </div>
            <div className="md:text-xl">
              <div className="mb-5">
                Мы готовим его по фирменному рецепту, позволяющему получить вкус
                домашней выпечки. Тесто никогда не замораживается, ведь только
                из свежей основы получается вкусная пицца
              </div>
            </div>
          </div>
          <div>
            <Image
              src="/taste.png"
              width="360"
              height="254"
              className="rounded-2xl mb-2"
            />
            <div className="text-2xl font-bold mt-7 mb-5">
              Уникальный томатный соус
            </div>
            <div className="md:text-xl">
              <div className="mb-5">
                В секретную рецептуру входят калифорнийские томаты, которые
                консервируют не более чем через 6 часов после сбора, и
                оригинальный набор специй
              </div>
            </div>
          </div>
          <div>
            <Image
              src="/taste.png"
              width="360"
              height="254"
              className="rounded-2xl mb-2"
            />
            <div className="text-2xl font-bold mt-7 mb-5">
              100% натуральный сыр Моцарелла
            </div>
            <div className="md:text-xl">
              <div className="mb-5">
                Производится из свежего молока специально для сети наших
                пиццерий
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-16">
        <div className="text-2xl md:text-5xl text-primary font-bold mb-10">
          форматы продукта
        </div>
        <div className="md:text-xl grid grid-cols-3 mb-7">
          <div className="col-span-2">
            Мы предлагаем гостям выбор из 20 фирменных видов пиццы. Рецепты
            разработаны с учетом сбалансированности вкуса и сочетаемости
            компонентов.
          </div>
        </div>
        <div className="text-2xl font-bold mb-7">
          Три размера позволяют заказать пиццу на любой случай:
        </div>
        <div className="md:gap-8 md:grid grid-cols-4">
          <div className="flex">
            <div className="w-full">
              <Image src="/35sm.png" width="160" height="160" />
            </div>
            <div className="ml-5 md:text-xl w-48">
              <div className="text-4xl text-primary">35 см</div>
              <div>Большая 4 персоны 12 кусков</div>
            </div>
          </div>
          <div className="flex">
            <div className="w-full">
              <Image src="/32sm.png" width="160" height="160" />
            </div>
            <div className="ml-5 md:text-xl w-48">
              <div className="text-4xl text-primary">32 см</div>
              <div>Средняя 3 персоны 8 кусков</div>
            </div>
          </div>
          <div className="flex">
            <div className="w-full">
              <Image src="/25sm.png" width="160" height="160" />
            </div>
            <div className="ml-5 md:text-xl w-48">
              <div className="text-4xl text-primary">25 см</div>
              <div>Маленькая 2 персоны 6 кусков</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-16">
        <div className="text-2xl md:text-5xl text-primary font-bold mb-10">
          Узнаваемый бренд
        </div>
        <div className="mb-10">
          <Image src="/popularBrand.png" width="1160" height="571" />
        </div>
        <div className="md:text-xl md:w-[960px]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
          pulvinar ullamcorper lorem tristique suscipit. Vestibulum ut tortor
          tincidunt, dictum risus non, pellentesque erat. Vestibulum efficitur
          sapien odio, at sagittis nulla pulvinar pharetra. Duis aliquet nisl
          scelerisque, ornare turpis feugiat, dapibus est. Vestibulum pharetra
          quis velit facilisis fermentum. Fusce facilisis varius porttitor.
          Aliquam placerat lorem in augue gravida pharetra. Donec non diam ac
          nibh viverra posuere. Sed turpis sapien, aliquam quis urna eu, varius
          molestie massa. Aliquam laoreet porta finibus. Ut lacinia nibh ut
          cursus pulvinar. Aenean et molestie sapien. Aenean porttitor nisi in
          justo tempus pellentesque luctus sit amet lorem. In hac habitasse
          platea dictumst.
        </div>
      </div>
      <div className="bg-gray-200 h-52 py-8 text-2xl space-y-6">
        <div>По вопросам франчайзинга</div>
        <div>
          <a href="tel:71-200-42-42"> 71-200-42-42</a>
        </div>
        <div>choparpizza@gmail.com</div>
      </div>
    </div>
  )
}

export default memo(Fran)
