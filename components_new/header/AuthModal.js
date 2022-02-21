import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, memo, useRef } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'

const AuthModal = ({ authOpen, onClose }) => {
  let [isOpen, setIsOpen] = useState(authOpen)
  let [isShowPrivacy, setIsShowPrivacy] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const { register, handleSubmit, reset, watch, formState } = useForm({
    mode: 'onChange',
  })
  const onSubmit = (data) => console.log(JSON.stringify(data))
  const authName = watch('name')
  const authPhone = watch('phone')

  const showPrivacy = (e) => {
    e.preventDefault()
    setIsOpen(false)
    setIsShowPrivacy(true)
  }

  const closePrivacy = () => {
    setIsShowPrivacy(false)
    setIsOpen(true)
  }

  let authButtonRef = useRef(null)
  let privacyButtonRef = useRef(null)

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={onClose}
          initialFocus={authButtonRef}
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
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="align-middle inline-block overflow-hidden w-full">
                <div className="inline-flex my-8 items-start">
                  <div className="align-middle bg-white inline-block overflow-hidden px-40 py-10 rounded-2xl shadow-xl text-center transform transition-all w-full">
                    <Dialog.Title as="h3" className="leading-6 text-3xl">
                      Авторизация
                    </Dialog.Title>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mt-10">
                        <label className="text-sm text-gray-400 mb-2 block">
                          Ваше имя
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            {...register('name')}
                            className="border border-primary focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full"
                          />
                          {authName && (
                            <button
                              className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                              onClick={() => {
                                reset('name')
                              }}
                            >
                              <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-10">
                        <label className="text-sm text-gray-400 mb-2 block">
                          Номер телефона
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            {...register('phone', {
                              required: true,
                              pattern: /^\+998\d\d\d\d\d\d\d\d\d$/i,
                            })}
                            className="border border-primary focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full"
                          />
                          {authPhone && (
                            <button
                              className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                              onClick={() => {
                                reset('phone')
                              }}
                            >
                              <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-10">
                        <button
                          className={`py-3 px-20 text-white font-bold text-xl rounded-full ${
                            formState.isValid ? 'bg-primary' : 'bg-gray-400'
                          }`}
                          disabled={!formState.isValid}
                          ref={authButtonRef}
                        >
                          Получить код
                        </button>
                      </div>
                    </form>
                    <div className="mt-5 text-gray-400 text-sm">
                      Нажимая получить код я принимаю условия{' '}
                      <a
                        href="/privacy"
                        onClick={showPrivacy}
                        className="text-primary block"
                        target="_blank"
                      >
                        пользовательского соглашения
                      </a>
                    </div>
                  </div>
                  <button
                    className="text-white outline-none focus:outline-none transform"
                    onClick={onClose}
                  >
                    <XIcon className="text-white cursor-pointer w-10 h-10" />
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isShowPrivacy} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closePrivacy}
          initialFocus={privacyButtonRef}
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
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="align-middle inline-block overflow-hidden w-full">
                <div className="inline-flex my-8 items-start">
                  <div className="align-middle bg-white inline-block max-w-4xl overflow-hidden p-10 rounded-2xl shadow-xl text-left transform transition-all w-full">
                    <div className="border-b mb-3 pb-3">
                      <Dialog.Title as="h3" className="leading-6 mb-2 text-2xl">
                        1. ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ (ОФЕРТА)
                      </Dialog.Title>
                      <p>
                        The standard Lorem Ipsum passage, used since the 1500s
                        "Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit, sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua. Ut enim ad minim veniam, quis
                        nostrud exercitation ullamco laboris nisi ut aliquip ex
                        ea commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit
                        anim id est laborum."
                      </p>
                    </div>
                    <div className="border-b mb-3 pb-3">
                      <Dialog.Title as="h3" className="leading-6 mb-2 text-2xl">
                        2. Предмет Пользовательского соглашения
                      </Dialog.Title>
                      <p>
                        "Sed ut perspiciatis unde omnis iste natus error sit
                        voluptatem accusantium doloremque laudantium, totam rem
                        aperiam, eaque ipsa quae ab illo inventore veritatis et
                        quasi architecto beatae vitae dicta sunt explicabo. Nemo
                        enim ipsam voluptatem quia voluptas sit aspernatur aut
                        odit aut fugit, sed quia consequuntur magni dolores eos
                        qui ratione voluptatem sequi nesciunt. Neque porro
                        quisquam est, qui dolorem ipsum quia dolor sit amet,
                        consectetur, adipisci velit, sed quia non numquam eius
                        modi tempora incidunt ut labore et dolore magnam aliquam
                        quaerat voluptatem. Ut enim ad minima veniam, quis
                        nostrum exercitationem ullam corporis suscipit
                        laboriosam, nisi ut aliquid ex ea commodi consequatur?
                        Quis autem vel eum iure reprehenderit qui in ea
                        voluptate velit esse quam nihil molestiae consequatur,
                        vel illum qui dolorem eum fugiat quo voluptas nulla
                        pariatur?"
                      </p>
                    </div>
                    <div className="border-b mb-3 pb-3">
                      <Dialog.Title as="h3" className="leading-6 mb-2 text-2xl">
                        3. Регистрация на Сайте и безопасность
                      </Dialog.Title>
                      <p>
                        "But I must explain to you how all this mistaken idea of
                        denouncing pleasure and praising pain was born and I
                        will give you a complete account of the system, and
                        expound the actual teachings of the great explorer of
                        the truth, the master-builder of human happiness. No one
                        rejects, dislikes, or avoids pleasure itself, because it
                        is pleasure, but because those who do not know how to
                        pursue pleasure rationally encounter consequences that
                        are extremely painful. Nor again is there anyone who
                        loves or pursues or desires to obtain pain of itself,
                        because it is pain, but because occasionally
                        circumstances occur in which toil and pain can procure
                        him some great pleasure. To take a trivial example,
                        which of us ever undertakes laborious physical exercise,
                        except to obtain some advantage from it? But who has any
                        right to find fault with a man who chooses to enjoy a
                        pleasure that has no annoying consequences, or one who
                        avoids a pain that produces no resultant pleasure?"
                      </p>
                    </div>
                    <div className="border-b mb-3 pb-3">
                      <Dialog.Title as="h3" className="leading-6 mb-2 text-2xl">
                        4. Интеллектуальная собственность и авторское право
                      </Dialog.Title>
                      <p>
                        "At vero eos et accusamus et iusto odio dignissimos
                        ducimus qui blanditiis praesentium voluptatum deleniti
                        atque corrupti quos dolores et quas molestias excepturi
                        sint occaecati cupiditate non provident, similique sunt
                        in culpa qui officia deserunt mollitia animi, id est
                        laborum et dolorum fuga. Et harum quidem rerum facilis
                        est et expedita distinctio. Nam libero tempore, cum
                        soluta nobis est eligendi optio cumque nihil impedit quo
                        minus id quod maxime placeat facere possimus, omnis
                        voluptas assumenda est, omnis dolor repellendus.
                        Temporibus autem quibusdam et aut officiis debitis aut
                        rerum necessitatibus saepe eveniet ut et voluptates
                        repudiandae sint et molestiae non recusandae. Itaque
                        earum rerum hic tenetur a sapiente delectus, ut aut
                        reiciendis voluptatibus maiores alias consequatur aut
                        perferendis doloribus asperiores repellat."
                      </p>
                    </div>
                    <div className="border-b mb-3 pb-3">
                      <Dialog.Title as="h3" className="leading-6 mb-2 text-2xl">
                        5. Права и обязанности Поверенного
                      </Dialog.Title>
                      <p>
                        "On the other hand, we denounce with righteous
                        indignation and dislike men who are so beguiled and
                        demoralized by the charms of pleasure of the moment, so
                        blinded by desire, that they cannot foresee the pain and
                        trouble that are bound to ensue; and equal blame belongs
                        to those who fail in their duty through weakness of
                        will, which is the same as saying through shrinking from
                        toil and pain. These cases are perfectly simple and easy
                        to distinguish. In a free hour, when our power of choice
                        is untrammelled and when nothing prevents our being able
                        to do what we like best, every pleasure is to be
                        welcomed and every pain avoided. But in certain
                        circumstances and owing to the claims of duty or the
                        obligations of business it will frequently occur that
                        pleasures have to be repudiated and annoyances accepted.
                        The wise man therefore always holds in these matters to
                        this principle of selection: he rejects pleasures to
                        secure other greater pleasures, or else he endures pains
                        to avoid worse pains."
                      </p>
                    </div>
                    <div className="border-b mb-3 pb-3">
                      <Dialog.Title as="h3" className="leading-6 mb-2 text-2xl">
                        6. Права и обязанности Пользователя
                      </Dialog.Title>
                      <p>
                        "But I must explain to you how all this mistaken idea of
                        denouncing pleasure and praising pain was born and I
                        will give you a complete account of the system, and
                        expound the actual teachings of the great explorer of
                        the truth, the master-builder of human happiness. No one
                        rejects, dislikes, or avoids pleasure itself, because it
                        is pleasure, but because those who do not know how to
                        pursue pleasure rationally encounter consequences that
                        are extremely painful. Nor again is there anyone who
                        loves or pursues or desires to obtain pain of itself,
                        because it is pain, but because occasionally
                        circumstances occur in which toil and pain can procure
                        him some great pleasure. To take a trivial example,
                        which of us ever undertakes laborious physical exercise,
                        except to obtain some advantage from it? But who has any
                        right to find fault with a man who chooses to enjoy a
                        pleasure that has no annoying consequences, or one who
                        avoids a pain that produces no resultant pleasure?"
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-white outline-none focus:outline-none transform"
                    onClick={closePrivacy}
                    ref={privacyButtonRef}
                  >
                    <XIcon className="text-white cursor-pointer w-10 h-10" />
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default memo(AuthModal)
