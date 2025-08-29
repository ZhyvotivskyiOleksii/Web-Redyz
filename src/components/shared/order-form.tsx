
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Ім'я має бути не менше 2 символів.",
  }),
  contact: z.string().min(5, {
      message: "Вкажіть ваш Email або телефон.",
  }),
  description: z.string().min(10, {
      message: "Опишіть ваш проєкт (мінімум 10 символів).",
  }).max(500, {
      message: "Опис не повинен перевищувати 500 символів.",
  })
})

export function OrderForm() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact: "",
      description: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "Дякуємо за ваше замовлення!",
      description: "Ми скоро зв'яжемося з вами.",
    })
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ім'я</FormLabel>
              <FormControl>
                <Input placeholder="Як до вас звертатися?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email або телефон</FormLabel>
              <FormControl>
                <Input placeholder="Ваш контакт для зв'язку" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Розкажіть про ваш проєкт</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Опишіть коротко ваші побажання, цілі та ідеї."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Надіслати</Button>
      </form>
    </Form>
  )
}
