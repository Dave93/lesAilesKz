import useTranslation from 'next-translate/useTranslation'
import { FC, memo } from 'react'
import Image from 'next/image'

const About: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <div className="mx-5 md:mx-0">
      <div className="text-3xl mb-1">{tr('about')}</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="md:grid md:grid-cols-3 gap-10 mb-8">
        <div className="text-2xl md:text-7xl text-yellow font-bold">
          ИСТОРИЯ “CHOPAR”
        </div>
        <div className="md:col-span-2">
          <div className="md:mb-6">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content
            here', making it look like readable English.
          </div>
          <div>
            Many desktop publishing packages and web page editors now use Lorem
            Ipsum as their default model text, and a search for 'lorem ipsum'
            will uncover many web sites still in their infancy. Various versions
            have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).
          </div>
        </div>
      </div>
      <div className="mb-6">
        <Image
          src="/aboutPageBanner.jpg"
          layout="responsive"
          width={1160}
          height={534}
        />
      </div>
      <div className="md:grid md:grid-cols-3 mb-6">
        <div className="text-2xl md:text-5xl text-blue font-bold">
          РАЗВИТИЕ СЕТИ ПИЦЦЕРИ «CHOPAR»
        </div>
        <div className="md:w-[570px] md:ml-10">
          <div className="mb-4">
            В 2018 году началось активное развитие сети в регионах.
          </div>
          <div className="mb-4">
            На сегодняшний день сеть пиццерии «Chopar» — одна из крупнейших и
            самых динамично развивающихся компаний в сфере ресторанного бизнеса
            в Узбекистане
          </div>
          <div>
            На сегодняшний день сеть пиццерии «Chopar» — одна из крупнейших и
            самых динамично развивающихся компаний в сфере ресторанного бизнеса
            в Узбекистане
          </div>
        </div>
      </div>
      <div>
        <div className="text-2xl md:text-5xl text-yellow md:w-[600px] font-bold mb-10">
          12-ПИЦЦЕРИ открыто по всему Узбекистану
        </div>
        <div className="md:grid grid-cols-4 gap-8 mb-16">
          <div>
            <div className="text-2xl mb-1">Мы уверены</div>
            <div className="border-b-2 w-24 border-yellow mb-2"></div>
            <div className="text-xs">
              вкусная и качественная еда может быть доступной; разнообразие
              нашего меню удовлетворит каждого; наша доставка сэкономит ваше
              время; вы получите удовольствие от еды!{' '}
            </div>
          </div>
          <div>
            <div className="text-2xl mb-1">Мы используем</div>
            <div className="border-b-2 w-24 border-yellow mb-2"></div>
            <div className="text-xs">
              только качественные продукты. высокотехнологичное оборудование от
              признанных лидеров индустрии; повышенные стандарты качества;
              современные и удобные способы заказа и оплаты нашей продукции.
            </div>
          </div>
          <div>
            <div className="text-2xl mb-1">Мы ценим</div>
            <div className="border-b-2 w-24 border-yellow mb-2"></div>
            <div className="text-xs">
              профессионализм и преданность своему делу наших сотрудников; опыт
              и надежность наших партнеров; лояльность и доверие наших клиентов.
            </div>
          </div>
        </div>
        <div className="md:w-[700px] mb-6 md:mb-0">
          <div className="mb-7">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content
            here', making it look like readable English.
          </div>
          <div>
            Many desktop publishing packages and web page editors now use Lorem
            Ipsum as their default model text, and a search for 'lorem ipsum'
            will uncover many web sites still in their infancy. Various versions
            have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(About)
