import React, { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

type BaseProps = {
    label: string;
    as?: 'input' | 'select' | 'checkbox';
    children?: ReactNode;
    hideLabel?: boolean;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { as?: 'input' | 'checkbox' };
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { as: 'select' };

type InputGroupProps = BaseProps & (InputProps | SelectProps);

export const InputGroup: React.FC<InputGroupProps> = ({ label, as = 'input', hideLabel = false, ...props }) => {
    const commonClasses = "w-full p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out bg-white";

    const renderInput = () => {
        if (as === 'select') {
            return <select className={commonClasses} {...(props as SelectProps)}>{props.children}</select>;
        }
        if (as === 'checkbox') {
            const { className, ...rest } = props as InputProps;
            return (
                <div className="flex items-center h-full">
                    <input type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded" {...rest} />
                </div>
            );
        }
        return <input className={commonClasses} inputMode="numeric" pattern="[0-9]*" {...(props as InputProps)} />;
    };

    if (as === 'checkbox') {
        return (
            <div className="flex items-center gap-2">
                {renderInput()}
                <label className={`block text-sm font-medium text-gray-700 ${hideLabel ? 'sr-only' : ''}`}>{label}</label>
            </div>
        );
    }

    return (
        <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${hideLabel ? 'sr-only' : ''}`}>
                {label}
            </label>
            {renderInput()}
        </div>
    );
};