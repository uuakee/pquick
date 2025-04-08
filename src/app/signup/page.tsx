"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Space_Grotesk } from "next/font/google";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useState, ChangeEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Mail, 
  MapPin, 
  Lock,
  Store,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

const segments = [
  { value: "ECOMMERCE", label: "E-commerce" },
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "SAAS", label: "SaaS" },
  { value: "MARKETING", label: "Marketing" },
  { value: "FINANCE", label: "Finanças" },
  { value: "EDUCATION", label: "Educação" },
  { value: "HEALTH", label: "Saúde" },
  { value: "ENTERTAINMENT", label: "Entretenimento" },
  { value: "IGAMING", label: "iGaming" },
  { value: "OTHER", label: "Outros" },
];

const steps = [
  {
    title: "Segmento",
    description: "Selecione seu segmento de atuação",
    icon: Store,
  },
  {
    title: "Contato",
    description: "Informações de contato",
    icon: Mail,
  },
  {
    title: "Empresa",
    description: "Dados da empresa",
    icon: Building2,
  },
  {
    title: "Endereço",
    description: "Localização da empresa",
    icon: MapPin,
  },
  {
    title: "Segurança",
    description: "Crie sua senha",
    icon: Lock,
  },
];

const MaskedInput = ({ 
  mask, 
  value, 
  onChange, 
  placeholder, 
  className,
  id,
  type,
  disabled
}: { 
  mask: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  type?: string;
  disabled?: boolean;
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    let unmaskedValue = value.replace(/[^0-9]/g, '');
    let maskedValue = '';
    let maskIndex = 0;
    let valueIndex = 0;

    while (maskIndex < mask.length && valueIndex < unmaskedValue.length) {
      if (mask[maskIndex] === '9') {
        maskedValue += unmaskedValue[valueIndex];
        valueIndex++;
      } else {
        maskedValue += mask[maskIndex];
      }
      maskIndex++;
    }

    onChange(maskedValue);
  };

  return (
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className={className}
      disabled={disabled}
      maxLength={mask.length}
    />
  );
};

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  const [formData, setFormData] = useState({
    segment: "",
    email: "",
    phone: "",
    cnpj: "",
    name: "",
    username: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setIsValidating(true);
    try {
      if (validateStep()) {
        setStep((prev) => prev + 1);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.segment) {
          newErrors.segment = "Selecione um segmento";
        }
        break;

      case 2:
        if (!formData.email) {
          newErrors.email = "E-mail é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "E-mail inválido";
        }

        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (!formData.phone) {
          newErrors.phone = "Telefone é obrigatório";
        } else if (phoneDigits.length !== 11) {
          newErrors.phone = "Telefone deve ter 11 dígitos";
        }
        break;

      case 3:
        const cnpjDigits = formData.cnpj.replace(/\D/g, "");
        if (!formData.cnpj) {
          newErrors.cnpj = "CNPJ é obrigatório";
        } else if (cnpjDigits.length !== 14) {
          newErrors.cnpj = "CNPJ deve ter 14 dígitos";
        } else if (!validateCNPJ(formData.cnpj)) {
          newErrors.cnpj = "CNPJ inválido";
        }

        if (!formData.name) {
          newErrors.name = "Nome da empresa é obrigatório";
        } else if (formData.name.length < 3) {
          newErrors.name = "Nome da empresa deve ter no mínimo 3 caracteres";
        }

        if (!formData.username) {
          newErrors.username = "Nome de usuário é obrigatório";
        } else if (formData.username.length < 3) {
          newErrors.username = "Nome de usuário deve ter no mínimo 3 caracteres";
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          newErrors.username = "Nome de usuário deve conter apenas letras, números e _";
        }
        break;

      case 4:
        if (!formData.address) {
          newErrors.address = "Endereço é obrigatório";
        } else if (formData.address.length < 5) {
          newErrors.address = "Endereço deve ter no mínimo 5 caracteres";
        }

        if (!formData.city) {
          newErrors.city = "Cidade é obrigatória";
        } else if (formData.city.length < 3) {
          newErrors.city = "Cidade deve ter no mínimo 3 caracteres";
        }

        if (!formData.state) {
          newErrors.state = "Estado é obrigatório";
        } else if (!/^[A-Z]{2}$/.test(formData.state)) {
          newErrors.state = "Estado deve ter 2 letras maiúsculas";
        }

        const cepDigits = formData.zip.replace(/\D/g, "");
        if (!formData.zip) {
          newErrors.zip = "CEP é obrigatório";
        } else if (cepDigits.length !== 8) {
          newErrors.zip = "CEP deve ter 8 dígitos";
        }
        break;

      case 5:
        if (!formData.password) {
          newErrors.password = "Senha é obrigatória";
        } else if (formData.password.length < 8) {
          newErrors.password = "Senha deve ter no mínimo 8 caracteres";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
          newErrors.password = "Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais";
        }

        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Confirme sua senha";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "As senhas não coincidem";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          segment: formData.segment,
          phone: formData.phone.replace(/\D/g, ""),
          cnpj: formData.cnpj.replace(/\D/g, ""),
          username: formData.username,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip.replace(/\D/g, ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      toast.success("Conta criada com sucesso!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Segmento de Atuação</Label>
              <Select
              
                value={formData.segment}
                onValueChange={(value) => updateFormData("segment", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu segmento" />
                </SelectTrigger>
                <SelectContent
                className="w-full">
                  {segments.map((segment) => (
                    <SelectItem key={segment.value} value={segment.value}>
                      {segment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <span className="text-xs text-red-500">{errors.email}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <MaskedInput
                id="phone"
                type="tel"
                mask="(99) 99999-9999"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(value) => updateFormData("phone", value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <span className="text-xs text-red-500">{errors.phone}</span>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <div className="relative">
                <MaskedInput
                  id="cnpj"
                  mask="99.999.999/9999-99"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(value) => handleCNPJChange(value)}
                  className={errors.cnpj ? "border-red-500 pr-10" : "pr-10"}
                  disabled={isLoadingCNPJ}
                />
                {isLoadingCNPJ && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/80" />
                  </div>
                )}
              </div>
              {errors.cnpj && (
                <span className="text-xs text-red-500">{errors.cnpj}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                placeholder="Digite o nome da empresa"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
                disabled={isLoadingCNPJ}
              />
              {errors.name && (
                <span className="text-xs text-red-500">{errors.name}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                placeholder="Digite seu nome de usuário"
                value={formData.username}
                onChange={(e) => updateFormData("username", e.target.value)}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <span className="text-xs text-red-500">{errors.username}</span>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zip">CEP</Label>
              <div className="relative">
                <MaskedInput
                  id="zip"
                  mask="99999-999"
                  placeholder="00000-000"
                  value={formData.zip}
                  onChange={(value) => handleCEPChange(value)}
                  className={errors.zip ? "border-red-500 pr-10" : "pr-10"}
                  disabled={isLoadingCEP}
                />
                {isLoadingCEP && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/80" />
                  </div>
                )}
              </div>
              {errors.zip && (
                <span className="text-xs text-red-500">{errors.zip}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Rua, número, complemento"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                className={errors.address ? "border-red-500" : ""}
                disabled={isLoadingCEP}
              />
              {errors.address && (
                <span className="text-xs text-red-500">{errors.address}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  className={errors.city ? "border-red-500" : ""}
                  disabled={isLoadingCEP}
                />
                {errors.city && (
                  <span className="text-xs text-red-500">{errors.city}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="UF"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => updateFormData("state", e.target.value.toUpperCase())}
                  className={errors.state ? "border-red-500" : ""}
                  disabled={isLoadingCEP}
                />
                {errors.state && (
                  <span className="text-xs text-red-500">{errors.state}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        const passwordStrength = getPasswordStrength(formData.password);
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500">{errors.password}</span>
              )}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength === 0
                            ? "w-0"
                            : passwordStrength.strength === 1
                            ? "w-1/5 bg-red-500"
                            : passwordStrength.strength === 2
                            ? "w-2/5 bg-orange-500"
                            : passwordStrength.strength === 3
                            ? "w-3/5 bg-yellow-500"
                            : passwordStrength.strength === 4
                            ? "w-4/5 bg-lime-500"
                            : "w-full bg-green-500"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.strength <= 1
                          ? "text-red-500"
                          : passwordStrength.strength === 2
                          ? "text-orange-500"
                          : passwordStrength.strength === 3
                          ? "text-yellow-500"
                          : passwordStrength.strength === 4
                          ? "text-lime-500"
                          : "text-green-500"
                      }`}
                    >
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground/80">
                    A senha deve conter:
                    <ul className="mt-1 space-y-1">
                      <li className={formData.password.length >= 8 ? "text-green-500" : ""}>
                        • Mínimo de 8 caracteres
                      </li>
                      <li className={/[a-z]/.test(formData.password) ? "text-green-500" : ""}>
                        • Pelo menos uma letra minúscula
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? "text-green-500" : ""}>
                        • Pelo menos uma letra maiúscula
                      </li>
                      <li className={/\d/.test(formData.password) ? "text-green-500" : ""}>
                        • Pelo menos um número
                      </li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "text-green-500" : ""}>
                        • Pelo menos um caractere especial
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-red-500">{errors.confirmPassword}</span>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/^(\d{5})(\d{3})/, "$1-$2");
  };

  const getPasswordStrength = (password: string): { strength: number; message: string } => {
    let strength = 0;
    const messages = [];

    if (password.length >= 8) {
      strength += 1;
      messages.push("✓ Mínimo de 8 caracteres");
    }
    if (/[a-z]/.test(password)) {
      strength += 1;
      messages.push("✓ Letra minúscula");
    }
    if (/[A-Z]/.test(password)) {
      strength += 1;
      messages.push("✓ Letra maiúscula");
    }
    if (/\d/.test(password)) {
      strength += 1;
      messages.push("✓ Número");
    }
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 1;
      messages.push("✓ Caractere especial");
    }

    let message = "";
    switch (strength) {
      case 0:
      case 1:
        message = "Muito fraca";
        break;
      case 2:
        message = "Fraca";
        break;
      case 3:
        message = "Média";
        break;
      case 4:
        message = "Forte";
        break;
      case 5:
        message = "Muito forte";
        break;
    }

    return { strength, message };
  };

  const validateCNPJ = (cnpj: string) => {
    cnpj = cnpj.replace(/[^\d]/g, "");

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs inválidos conhecidos
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  };

  const fetchAddressByCEP = async (cep: string): Promise<{
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    erro?: boolean;
  }> => {
    try {
      const cleanCEP = cep.replace(/\D/g, "");
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return { erro: true };
    }
  };

  const handleCEPChange = async (value: string) => {
    updateFormData("zip", value);
    const cleanCEP = value.replace(/\D/g, "");
    
    if (cleanCEP.length === 8) {
      setIsLoadingCEP(true);
      try {
        const address = await fetchAddressByCEP(cleanCEP);
        if (!address.erro) {
          updateFormData("address", address.logradouro || "");
          updateFormData("city", address.localidade || "");
          updateFormData("state", address.uf || "");
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.zip;
            delete newErrors.address;
            delete newErrors.city;
            delete newErrors.state;
            return newErrors;
          });
        }
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const fetchCompanyByCNPJ = async (cnpj: string): Promise<{
    nome?: string;
    fantasia?: string;
    erro?: boolean;
  }> => {
    try {
      const cleanCNPJ = cnpj.replace(/\D/g, "");
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCNPJ}`);
      const data = await response.json();
      
      if (response.ok) {
        return {
          nome: data.razao_social,
          fantasia: data.estabelecimento?.nome_fantasia,
        };
      }
      
      return { erro: true };
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      return { erro: true };
    }
  };

  const handleCNPJChange = async (value: string) => {
    updateFormData("cnpj", value);
    const cleanCNPJ = value.replace(/\D/g, "");
    
    if (cleanCNPJ.length === 14) {
      setIsLoadingCNPJ(true);
      try {
        const company = await fetchCompanyByCNPJ(cleanCNPJ);
        if (!company.erro && company.nome) {
          updateFormData("name", company.nome);
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.cnpj;
            delete newErrors.name;
            return newErrors;
          });
          toast.success("Dados da empresa carregados com sucesso!");
        } else {
          toast.error("Não foi possível carregar os dados da empresa. Por favor, preencha manualmente.");
        }
      } catch (error) {
        toast.error("Erro ao buscar dados da empresa. Por favor, preencha manualmente.");
      } finally {
        setIsLoadingCNPJ(false);
      }
    }
  };

  return (
    <div className={spaceGrotesk.className}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] scale-[1.2]" />
        <div className="absolute inset-0 bg-[#f25100]/5 blur-[100px] rotate-12" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#f25100]/25 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#f25100]/25 blur-[100px]" />

        <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md border border-white/10 bg-card/30 backdrop-blur-xl shadow-xl shadow-black/10">
            <CardHeader className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-16 w-32 md:w-32">
                  <Image
                    src="/plataform/logo-expand.svg"
                    alt="logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Steps Indicator */}
                <div className="w-full flex justify-between px-2">
                  {steps.map((s, i) => {
                    const StepIcon = s.icon;
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                            i < step
                              ? "border-[#f25100] bg-[#f25100] text-white"
                              : i === step
                              ? "border-[#f25100] text-[#f25100]"
                              : "border-white/20 text-white/20"
                          }`}
                        >
                          {i < step ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                          {i < steps.length - 1 && (
                            <div
                              className={`absolute left-full w-full h-[2px] transition-all duration-300 ${
                                i < step ? "bg-[#f25100]" : "bg-white/20"
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium transition-all duration-300 ${
                            i === step ? "text-[#f25100]" : "text-white/40"
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center space-y-2">
                  <motion.h1
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {steps[step - 1].title}
                  </motion.h1>
                  <motion.p
                    key={`desc-${step}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-muted-foreground/80"
                  >
                    {steps[step - 1].description}
                  </motion.p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={false}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={isLoading || isValidating}
                        className="border-white/10 hover:bg-white/5 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                      </Button>
                    </motion.div>
                  )}
                  <div className="flex-1" />
                  {step < 5 ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Button
                        onClick={handleNext}
                        disabled={isLoading || isValidating}
                        className="bg-[#f25100] text-white hover:bg-[#f25100]/90 flex items-center gap-2"
                      >
                        {isValidating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Validando...
                          </>
                        ) : (
                          <>
                            Próximo
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading || isValidating}
                        className="bg-[#f25100] text-white hover:bg-[#f25100]/90 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          <>
                            Criar Conta
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
              >
                <div className="text-center mt-6">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground/80 hover:text-[#f25100] transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Já tem uma conta? Faça login
                  </Link>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
