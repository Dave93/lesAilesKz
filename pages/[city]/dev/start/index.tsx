import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import React, { Fragment, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Ru, Uz } from 'react-flags-select'
import { useUI } from '@components/ui/context'
import Link from '@components/ui/Link'
import { motion } from 'framer-motion'
import { shuffle as lodashShuffle } from 'lodash'
import { Dialog, Transition } from '@headlessui/react'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products } = await productsPromise
  const { pages } = await pagesPromise
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      currentCity,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
}

export default function Dev() {
  const router = useRouter()
  const { locale, pathname } = router
  const { activeCity, cities } = useUI()
  const [shuffle, setShuffle] = useState(false)
  const [chosenCard, setChosenCard] = useState(null as any)
  const [isOpenCard, setIsOpenCard] = useState(false)
  const [shuffleItems, setShuffleItems] = useState([
    {
      id: 45,
      image: '/surprise/2.png',
      name: 'пицца пепперони',
    },
    {
      id: 46,
      image: '/surprise/3.png',
      name: ' Соca-cola 0,5 литр',
    },
    {
      id: 47,
      image: '/surprise/4.png',
      name: 'греческий салат',
    },
    {
      id: 48,
      image: '/surprise/2.png',
      name: 'пицца пепперони',
    },
    {
      id: 49,
      image: '/surprise/7.png',
      name: ' Соca-cola 1,5 литр',
    },
    {
      id: 50,
      image: '/surprise/4.png',
      name: 'греческий салат',
    },
  ])

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    let path = pathname.replace('[city]', activeCity.slug)
    return router.push(path, path, {
      locale: loc,
    })
  }

  const openCard = (sh: any) => {
    if (shuffle) {
      setChosenCard(sh)
      setIsOpenCard(true)
    }
  }

  const closeCard = () => {
    router.push('/')
  }

  const startShuffle = () => {
    setShuffle(true)
    setTimeout(() => {
      let items = lodashShuffle([...shuffleItems])
      items = lodashShuffle(items)
      // items = lodashShuffle(items)
      items = lodashShuffle(items)

      setShuffleItems(items)

      setTimeout(() => {
        items = lodashShuffle([...items])
        items = lodashShuffle(items)
        // items = lodashShuffle(items)
        items = lodashShuffle(items)

        setShuffleItems(items)
      }, 200)
    }, 600)
  }

  return (
    <div
      className="h-screen w-screen bg-secondary md:px-36 px-2 py-4 fixed overflow-auto"
      style={{
        backgroundImage: `url("/Union.png")`,
        backgroundSize: 'cover',
      }}
    >
      <div className="flex justify-between items-center">
        <Link href={`/${chosenCity.slug}`} prefetch={false}>
          <Image src="/assets/footer_logo.svg" width={200} height={72} />
        </Link>
        <div className="w-44 h-10 bg-blue rounded-full flex justify-between">
          <a
            className={`${
              locale == 'ru' ? 'bg-white text-secondary ' : 'text-white'
            } font-medium inline-flex items-center px-4 mx-1 my-1 rounded-full w-20`}
            href={`/${locale}${pathname}`}
            onClick={(e) => changeLang(e, 'ru')}
          >
            <Ru className="w-5" />
            <span className="ml-1.5">{localeLabel.ru}</span>
          </a>
          <a
            className={`${
              locale == 'uz' ? 'bg-white text-secondary ' : 'text-white'
            } font-medium inline-flex items-center px-4 mx-1 my-1 rounded-full w-20`}
            href={`/${locale}${pathname}`}
            onClick={(e) => changeLang(e, 'uz')}
          >
            <Uz className="w-5" />
            <span className="ml-1.5">{localeLabel.uz}</span>
          </a>
        </div>
      </div>

      {!shuffle ? (
        <div className="font-bold mt-5 text-4xl text-center text-white uppercase">
          Перемешайте чтобы{' '}
          <span className="text-primary"> получить подарок</span>
        </div>
      ) : (
        !isOpenCard && (
          <div className="font-bold mt-5 text-4xl text-center text-white uppercase">
            Выберите один из коробок
          </div>
        )
      )}

      {!isOpenCard && (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-8 gap-y-28 relative mt-32">
          {shuffleItems.map((sh, i) => (
            <motion.div
              className="bg-white rounded-3xl h-32 text-center relative"
              key={sh.id}
              layout
              transition={{ type: 'spring' }}
              onClick={() => openCard(sh)}
            >
              <div className="lg:ml-10 md:-top-24 absolute lg:-top-28 lg:w-56 w-56 md:w-auto -top-32">
                <img src={shuffle ? '/surprise/box.png' : sh.image} alt="" />
              </div>
              {!shuffle && (
                <div className="text-xl font-bold absolute bottom-2 ml-auto w-full ">
                  {sh.name}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      {!shuffle && (
        <div className="m-auto w-max mt-8">
          <button
            onClick={() => {
              startShuffle()
            }}
            className="text-white md:text-4xl text-2xl px-3 font-bold bg-primary border-white border-2 rounded-full md:px-32 pt-1 pb-3"
          >
            перемешать
          </button>
        </div>
      )}
      <Transition appear show={isOpenCard} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {}}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="align-middle bg-white inline-block overflow-hidden px-20 py-10 rounded-2xl shadow-xl text-center transform transition-all">
              <Dialog.Title
                as="h3"
                className="leading-6 md:text-6xl text-secondary md:w-72"
              >
                {chosenCard?.name}
              </Dialog.Title>
              <img className="m-auto" src={chosenCard?.image} alt="" />
              <div className="md:w-72 m-auto">
                <span className="text-primary">Поздравляем!</span>{' '}
                <span className="font-bold">ваш выиграш</span> автоматическии
                добавлен в корзину, что-бы продолжить покупку нажмите кнопку
                “перейти в меню”
              </div>
              <button
                onClick={() => closeCard()}
                className="bg-secondary rounded-full px-12 py-3 text-xl text-white mt-3"
              >
                Перейти в меню
              </button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
