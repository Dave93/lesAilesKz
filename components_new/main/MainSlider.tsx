import { FC, memo, createRef, useState, useEffect } from 'react'
import Flicking, { ViewportSlot } from '@egjs/react-flicking'
import { Fade, AutoPlay, Pagination, Arrow } from '@egjs/flicking-plugins'
import Image from 'next/image'
import { useUI } from '@components/ui'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import getConfig from 'next/config'
import Slider from 'react-slick'

const { publicRuntimeConfig } = getConfig()

const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        infinite: true,
        dots: false
      }
    },
    {
      breakpoint: 480,
      settings: {
        dots: true,
        // nextArrow: null,
        // prevArrow: null
      }
    }
  ]
};


function SampleNextArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <img src="/rightArrow.webp" className={className}
      style={{ ...style, display: "block", height: "40px" }}
      onClick={onClick} />
  );
}

function SamplePrevArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <img src="/leftArrow.webp" className={className}
      style={{ ...style, display: "block", height: "40px" }}
      onClick={onClick} />
  );
}


const MainSlider: FC = () => {
  let router = useRouter()

  const [sliders, setSliders] = useState([])
  const [defaultIndex, setDefaultIndex] = useState(1)

  const { locale } = router

  const plugins = [
    new Fade('', 0.4),
    new AutoPlay({ duration: 3000, direction: 'NEXT', stopOnHover: false }),
    new Pagination({ type: 'bullet' }),
    new Arrow({
      parentEl: typeof window !== 'undefined' ? document.body : null,
    }),
  ]
  const sliderRef = createRef<Flicking>()

  const fetchSliders = async () => {
    const { data } = await axios.get(
      `${publicRuntimeConfig.apiUrl}/api/sliders/public?locale=${locale}`
    )
    // sliderRef.current?.moveTo(0)
    // sliderRef.current?.destroy()
    // setDefaultIndex(1)
    setSliders(data.data)
    // setTimeout(() => {
    //   sliderRef.current?.init()
    // }, 200)
  }

  useEffect(() => {
    fetchSliders()
    return
  }, [locale])

  return (
    <div className="mt-5 mx-4 md:mx-0">
      {sliders && sliders.length > 0 && (
        <Slider  {...settings}>
          {sliders.map((item: any) => (
            <div
              className="rounded-[15px] overflow-hidden flex mb-[10px]"
              key={item.id}
            >
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
                        width="100%"
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
                        width="100%"
                        height={176}
                      />
                    </div>
                  </>
                )
              )}
            </div>
          ))}
        </Slider>
      )}
    </div>
  )
}

export default memo(MainSlider)
