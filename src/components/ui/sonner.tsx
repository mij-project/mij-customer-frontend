import { Check, CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      // theme="light"
      className="toaster group"
      icons={{
        success: <Check className="h-4 w-4" color="#6DE0F7" />,
        info: <Info className="h-4 w-4" color="#6DE0F7" />,
        warning: <TriangleAlert className="h-4 w-4" color="#6DE0F7" />,
        error: <OctagonX className="h-4 w-4" color="#6DE0F7" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" color="#6DE0F7" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg [&_svg]:!text-[#6DE0F7] [&_svg]:!stroke-[#6DE0F7] [&>*>svg]:!text-[#6DE0F7] [&>*>svg]:!stroke-[#6DE0F7] [&>*>svg]:!fill-[#6DE0F7]',
          description:
            'group-[.toast]:text-muted-foreground [&_svg]:!text-[#6DE0F7] [&_svg]:!stroke-[#6DE0F7] [&>*>svg]:!text-[#6DE0F7] [&>*>svg]:!stroke-[#6DE0F7] [&>*>svg]:!fill-[#6DE0F7]',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground [&_svg]:!text-[#6DE0F7] [&_svg]:!stroke-[#6DE0F7] [&>*>svg]:!text-[#6DE0F7] [&>*>svg]:!stroke-[#6DE0F7] [&>*>svg]:!fill-[#6DE0F7]',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground [&_svg]:!text-[#6DE0F7] [&_svg]:!stroke-[#6DE0F7] [&>*>svg]:!text-[#6DE0F7] [&>*>svg]:!stroke-[#6DE0F7] [&>*>svg]:!fill-[#6DE0F7]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
