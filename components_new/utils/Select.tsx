import React, { FC, memo } from 'react'
import { useSelect } from 'downshift'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { ClockIcon } from '@heroicons/react/outline'

interface SelectItem {
  value: string
  label: string
}

interface SelectProps {
  items: SelectItem[]
  onChange: any
  placeholder: string
  className?: string
}

const Select: FC<SelectProps> = ({
  items,
  onChange,
  placeholder,
  className,
}) => {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem?.value),
  })
  return (
    <>
      <div
        className={`bg-gray-100  flex items-center  rounded-2xl p-4 ${
          className || ''
        }`}
      >
        <ClockIcon className="w-5 mr-3" />
        <button
          type="button"
          {...getToggleButtonProps()}
          className="flex items-center cursor-pointer relative"
        >
          <span>{selectedItem?.label || placeholder}</span>
          <ChevronDownIcon className="h-4 w-4 ml-2" />
        </button>
      </div>
      <ul
        {...getMenuProps()}
        className="absolute bg-gray-100 mt-2 shadow-md z-40 rounded-b-md overflow-hidden max-h-28 overflow-y-auto"
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              key={`${item.label}${index}`}
              {...getItemProps({ item, index })}
              className={`cursor-pointer px-3 py-2 text-gray-400 ${
                highlightedIndex === index ? 'bg-gray-200' : 'bg-gray-100'
              }`}
            >
              {item.label}
            </li>
          ))}
      </ul>
    </>
  )
}

export default Select
