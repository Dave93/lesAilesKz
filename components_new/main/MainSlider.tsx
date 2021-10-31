import { FC, memo, createRef, useState, useEffect } from 'react'
import Flicking, { ViewportSlot } from '@egjs/react-flicking'
import { Fade, AutoPlay, Pagination, Arrow } from '@egjs/flicking-plugins'
import Image from 'next/image'
import { useUI } from '@components/ui'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const MainSlider: FC = () => {
  let router = useRouter()

  const [sliders, setSliders] = useState([])
  const [defaultIndex, setDefaultIndex] = useState(1)

  const { locale } = router

  const plugins = [
    new Fade('', 0.4),
    new AutoPlay({ duration: 3000, direction: 'NEXT', stopOnHover: false }),
    new Pagination({ type: 'bullet' }),
    new Arrow(),
  ]
  const sliderRef = createRef<Flicking>()

  const fetchSliders = async () => {
    const { data } = await axios.get(
      `${publicRuntimeConfig.apiUrl}/api/sliders/public?locale=${locale}`
    )
    // sliderRef.current?.moveTo(0)
    sliderRef.current?.destroy()
    setDefaultIndex(1)
    setSliders(data.data)
    setTimeout(() => {
      sliderRef.current?.init()
    }, 100)
  }

  useEffect(() => {
    fetchSliders()
    return
  }, [locale])

  return (
    <div className="relative rounded-2xl">
      {sliders && sliders.length > 0 && (
        <>
          <Flicking
            align="center"
            circular={true}
            defaultIndex={defaultIndex}
            plugins={plugins}
            ref={sliderRef}
            renderOnlyVisible={true}
            autoResize={true}
            autoInit={true}
          >
            {sliders.map((item: any) => (
              <div className="panel max-w-full mr-6" key={item.id}>
                <div className="rounded-[15px] overflow-hidden flex mb-[10px]">
                  {item.link ? (
                    <a href={item.link}>
                      {item.asset && (
                        <>
                          <img
                            src={item.asset[0].link}
                            width={1160}
                            height={340}
                            data-href={item.link}
                            className="hidden md:flex "
                          />
                          <img
                            src={
                              item.asset[1]
                                ? item.asset[1].link
                                : item.asset[0].link
                            }
                            width={400}
                            height={176}
                            data-href={item.link}
                            className="md:hidden flex"
                          />
                        </>
                      )}
                    </a>
                  ) : (
                    item.asset && (
                      <>
                        <div className="hidden md:flex">
                          <img
                            src={item.asset[0].link}
                            width={1160}
                            height={340}
                          />
                        </div>
                        <div className="md:hidden flex">
                          <img
                            src={
                              item.asset[1]
                                ? item.asset[1].link
                                : item.asset[0].link
                            }
                            width={400}
                            height={176}
                          />
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>
            ))}
            <ViewportSlot>
              <div className="md:hidden flicking-pagination justify-center flex"></div>
              <span className="flicking-arrow-prev  hidden md:block"></span>
              <span className="flicking-arrow-next  hidden md:block"></span>
            </ViewportSlot>
          </Flicking>
        </>
      )}

      <style jsx global>{`
        .flicking-pagination-bullet {
          width: 15.18px;
          height: 4px;
          background: rgba(210, 210, 210, 0.8);
          border-radius: 10px;
          margin-right: 4px;
        }

        .flicking-pagination-bullet.flicking-pagination-bullet-active {
          background: #faaf04;
        }
      `}</style>
    </div>
  )
}

export default memo(MainSlider)
